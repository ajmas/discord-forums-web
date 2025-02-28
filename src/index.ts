import fs from 'fs/promises';
import { AnyThreadChannel, Channel, ChannelType, Client, FetchedThreads, ForumChannel, ForumThreadChannel, IntentsBitField, Message, Partials, ThreadChannel } from 'discord.js';
import { Command } from 'commander';
import { writeToHtml } from './HtmlOutput';

async function getClient (token: string): Promise<Client<boolean>> {
  if (!token) {
    throw new Error('Discord token is required');
  }

  // eslint-disable-next-line no-async-promise-executor
  const client = await new Promise<Client>(async (resolve, reject) => {
    const intents: number[] = [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildEmojisAndStickers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.GuildPresences,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.DirectMessages,
      IntentsBitField.Flags.DirectMessageTyping
    ];

    const partials: Partials[] = [
      Partials.Channel,
      Partials.Message
    ];

    const client = new Client({
      intents,
      partials
    });

    client.on('error', async (error) => {
      reject(error);
    });

    client.on('ready', async () => {
      resolve(client);
    });

    await client.login(token);
  });

  return client;
}

function messageToJson (message: Message): Record<string, unknown> {
  const messageObj: Record<string, unknown> = {};
  messageObj.id = message.id;
  messageObj.content = message.content;
  messageObj.author = message.author.username;
  messageObj.createdAt = message.createdAt;
  messageObj.attachments = message.attachments;
  return messageObj;
}

async function threadToJson (thread: AnyThreadChannel, channel: ForumChannel): Promise<Record<string, unknown>> {
  const threadObj: Record<string, unknown> = {};
  threadObj.id = thread.id;
  threadObj.name = thread.name;
  threadObj.tags = thread.appliedTags.map(appliedTag => channel.availableTags.find(tag => tag.id == appliedTag)).map(tag => tag?.name);
  threadObj.archived = thread.archived;
  threadObj.archivedAt = thread.archivedAt;
  threadObj.createdAt = thread.createdAt;
  threadObj.messages = [];

  const messages = await thread.messages.fetch({ cache: true, limit: 100 });
  messages.forEach(message => {
    (threadObj.messages as Record<string, unknown>[]).push(messageToJson(message));
  });

  return threadObj;
}

async function threadsToJson (threads: AnyThreadChannel[], channel: ForumChannel) {
  let threadObjs: Record<string, unknown>[] = [];
  for (let i = 0; i < threads.length; i++) {
    threadObjs.push(await threadToJson(threads[i], channel));
  }
  return threadObjs;
}

async function listForumThreads (token: string, channelId: string, since?: Date) {
  const client = await getClient(token);
  const channel = client.channels.cache.get(channelId) as Channel;

  let allThreads: Record<string, unknown>[] = [];

  if (channel?.type === ChannelType.GuildForum) {
    let threadCache: FetchedThreads;
    let threads: Record<string, unknown>[];

    threadCache= await channel.threads.fetchActive(true);
    threads = await threadsToJson(Array.from(threadCache.threads.entries()).map(entry => entry[1]), channel);
    allThreads = [ ...allThreads, ...threads ];

    threadCache = await channel.threads.fetchArchived({ fetchAll: true });
    threads = await threadsToJson(Array.from(threadCache.threads.entries()).map(entry => entry[1]), channel);
    allThreads = [ ...allThreads, ...threads ];
  }

  return allThreads;
}

async function main () {
  const program = new Command();
  program
    .requiredOption('-t, --token <token>', 'Discord bot token')
    .requiredOption('-c, --channelid <channel_id>', 'Channel ID')
    .option('-s, --since <since>', 'Messages since')
    .option('--format <format>', 'Output format (json, html)', 'json')
    .option('-f, --file <output_file>', 'File to write to, otherwise stdout')
    .showHelpAfterError();

  program.parse(process.argv);
  const options = program.opts();

  const threads = await listForumThreads(options.token, options.channelid);

  let output = '';
  if (options.format === 'html') {
    output = writeToHtml(threads);
  } else {
    output = JSON.stringify(threads, undefined, 2);
  }

  if (options.file) {
    await fs.writeFile(options.file, output, 'utf-8');
    console.log(`Results written to '${options.file}'`);
  } else {
    console.log(output);
  }

  process.exit(0);
}

main().catch(error => console.log(error));