const ui = require('./_ui');
const chat = require('./_chat');

function run() {
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
  // run();
  ui.showConvoMain();
});
