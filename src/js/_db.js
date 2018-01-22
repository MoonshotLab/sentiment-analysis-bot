const Promise = require('bluebird');

function logJokeReaction(joke, reaction) {
  console.log(joke, reaction);

  $.ajax({
    type: 'POST',
    url: '/stats/log-joke',
    data: {
      joke: joke,
      reaction: reaction
    }
  })
    .then(res => {
      console.log('successfully logged to db');
    })
    .catch(e => {
      console.log('error logging to db', e);
    });
}

exports.logJokeReaction = logJokeReaction;
