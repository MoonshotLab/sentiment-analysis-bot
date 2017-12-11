const ui = require('./_ui');

function run() {
  ui
    .asyncInit()
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
