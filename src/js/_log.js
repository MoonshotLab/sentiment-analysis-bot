const axios = require('axios');
const qs = require('qs');
const moment = require('moment');

axios.defaults.headers.common['Authorization'] = process.env.SECRET;

function getReactionObj(textResponse, textSentiment, videoSentiment) {
  console.log('textResponse', textResponse);
  console.log('textSentiment', textSentiment);
  console.log('videoSentiment', videoSentiment);

  const reactionObj = {
    video: {
      sentiment: videoSentiment
    },
    text: {
      transcription: textResponse,
      sentiment: textSentiment
    },
    sessionId: window.sessionId || null,
    timestamp: moment().format()
  };

  return reactionObj;
}

function recordFeelingReaction(textResponse, textSentiment, videoSentiment) {
  const url = '/log/feeling';
  const reactionObj = getReactionObj(
    textResponse,
    textSentiment,
    videoSentiment
  );
  makeRecordCall(url, reactionObj);
}

function recordJokeReaction(
  jokeText,
  textResponse,
  textSentiment,
  videoSentiment
) {
  const url = '/log/joke';
  const reactionObj = getReactionObj(
    textResponse,
    textSentiment,
    videoSentiment
  );
  const reactionObjWithJokeText = Object.assign(reactionObj, {
    joke: jokeText
  });
  makeRecordCall(url, reactionObjWithJokeText);
}

function makeRecordCall(url, reactionObj) {
  try {
    console.log(reactionObj);
    axios({
      url: url,
      method: 'POST',
      data: qs.stringify(reactionObj)
    })
      .then(() => {
        console.log('Successfully posted to log');
      })
      .catch(e => {
        console.log('Unable to post to log', e);
      });
  } catch (e) {
    console.log('Unable to post to log', e);
  }
}

exports.recordFeelingReaction = recordFeelingReaction;
exports.recordJokeReaction = recordJokeReaction;
