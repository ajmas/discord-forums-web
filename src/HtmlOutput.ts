const styles = `body {
  font-family: sans-serif;
}
thread {
  display: block;
  border: solid 1px black;
  margin: 7px;
  padding: 14px;
}
ul.tags {
  list-style: none;
  display: flex;
  gap: 16px;
  padding: 0;
}
ul.tags li {
  border: solid 1px black;
  border-radius: 7px;
  // background: blue;
  padding: 2px 5px;
}
ul.messages {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0;
}
ul.messages li {
  border: solid 1px grey;
	padding: 7px;
}
`;

function writeToHtml (threads: Record<string, unknown>[]): string {
  let html: string = '';
  html = '<!DOCTYPE html>\n';
  html += '<html>\n';
  html += '<head>\n';
  html += `<style>\n${styles}\n</style>\n`;
  html += '</head>';

  html += '<body>';

  for (let i = 0; i < threads.length; i++) {
    html += `<thread title="${threads[i].name}">`;
    html += `<h3>${threads[i].name}</h3>`;
    html += '<ul class="tags">';

    (threads[i].tags as string[]).forEach(tag => html += `<li>${tag}</li>`);

    html += '</ul>';

    html += '<ul class="messages">';
    const messages = threads[i].messages as Record<string, unknown>[];
    for (let j = messages.length - 1; j >= 0; j--) {
      html += '<li createdat="">';
      html += `<pre>${messages[j].content}</pre>`
      html += '</li>\n';
    }
    html += '</ul>\n';
    html += '</thread>\n';
  }

  html += '</body></html>';

  return html;
}

export { writeToHtml };
