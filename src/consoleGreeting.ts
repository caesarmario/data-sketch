const greetingKey = Symbol.for('datasketch.caesarmar.io.consoleGreeting');
const mono = 'font-family:ui-monospace,SFMono-Regular,Consolas,monospace;';
const green = 'color:#00E677;background-color:#1A1A1A;padding:2px 6px;';

const signature = String.raw`Developed by:
 __    __  ______  ______
/\ "-./  \/\  __ \/\  == \
\ \ \-./\ \ \  __ \ \  __<
 \ \_\ \ \_\ \_\ \_\ \_\ \_\
  \/_/  \/_/\/_/\/_/\/_/ /_/`;

export function printConsoleGreeting() {
  // The document marker survives hot reloads but resets on a full page load.
  if (typeof document === 'undefined' || Reflect.get(document, greetingKey)) return;

  console.log(
    '%cDATA SKETCH / MARGIN NOTES\n\n%cRead between the boxes.\n\n' +
      '%c[ source ] --> [ transform ] --> [ destination ]\n\n%c' +
      'Pick an arrow and trace the data through it.\n' +
      'Check what changes along the way,\n' +
      'and what happens if the flow stops.\n\n%c' +
      signature +
      '\n%c-= https://caesarmar.io/ =-',
    `${mono}font-size:11px;font-weight:700;${green}`,
    `${mono}font-size:22px;font-weight:700;`,
    `${mono}font-size:13px;font-weight:400;${green}`,
    `${mono}font-size:14px;font-weight:400;`,
    `${mono}font-size:12px;font-weight:400;`,
    `${mono}font-size:12px;font-weight:400;${green}`,
  );

  Reflect.set(document, greetingKey, true);
}
