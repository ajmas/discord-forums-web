# Discord Forums Web

Status: unreleased / in-development

The intent of this project is make it so that the messages in a
Discord forum channel can be published to the web.

The motivation is finding that a lot of valuable knowledge are
being hidden behind the walls of a Discord server, such that they
can't be indexed and searched on the web.

## Consent & Privacy

In putting this project together, we should be mindful of making sure
that any user that joins a Discord server using this project is made
aware that their forum questions and answers will be shared publically
on a website.

We will also look to see if there is a way to allow providing anonymised
user names, either at general level or a user specifc lavel.

## Implementation

This project is written in Typescript and makes use of the Discord.js
package.

## Running

First get the dependencies via `npm install`,

then run the app via `npm run main` and provide options as follows (substituting
the values as appropriate):

```bash
npm run main -- --token mytoken --channelid 12345 --format json --file output.json
```

## License

MIT

