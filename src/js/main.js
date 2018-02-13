const ui = require('./_ui');
const chat = require('./_chat');

const uuid = require('uuid/v1'); // v1 UUID (time-based)

function setSessionId() {
  const foo = uuid();
  console.log('setting uuid', foo);
  window.sessionId = foo;
  console.log('window.sessionId', window.sessionId);
}

function run() {
  setSessionId();

  ui
    .asyncInit()
    .then(chat.asyncInit)
    .then(chat.keepAwake)
    // .then(() => {
    //   return chat.asyncBotSay('Is this thing on?');
    // })
    .then(() => {
      console.log('done!');
    })
    .catch(e => {
      console.log('Error', e);
    });
}

$(window).on('load', function() {
  run();
});
