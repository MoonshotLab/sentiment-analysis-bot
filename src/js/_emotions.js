const Promise = require('bluebird');

const chat = require('./_chat');
const ui = require('./_ui');
const config = require('./_config');
const chart = require('./_chart');

// let audioEmotions = [];
const emotionThreshold = 0.1;
const neutralityThreshold = config.emotions.neutralityThreshold;

let videoEmotionsHistory = [];

function getNormalizedVideoSentiment(videoEmotions) {
  let normalizedVideoSentiment = 0;

  console.log('videoEmotions', videoEmotions);

  if ('joy' in videoEmotions) normalizedVideoSentiment += videoEmotions['joy'];
  if ('surprise' in videoEmotions)
    normalizedVideoSentiment += videoEmotions['surprise'];
  if ('sadness' in videoEmotions)
    normalizedVideoSentiment -= videoEmotions['sadness'];
  if ('anger' in videoEmotions)
    normalizedVideoSentiment -= videoEmotions['anger'];

  return normalizedVideoSentiment;
}

function getFormattedTextSentiment(sentimentScore) {
  console.log('sentiment score', sentimentScore);
  sentimentScore = parseInt(sentimentScore * 10) / 10;

  const formattedScore = [];
  let sentimentRating = null;

  if (sentimentScore < -1 * neutralityThreshold) {
    sentimentRating = 'negative';
  } else if (sentimentScore < neutralityThreshold) {
    sentimentRating = 'neutral';
  } else {
    sentimentRating = 'positive';
  }

  return {
    name: sentimentRating,
    val: sentimentScore
  };
}

function getVideoEmotionsObj(facesInfo) {
  if (facesInfo.length == 0) return {};

  // for now, only consider first face
  const emotions = facesInfo[0].emotions;

  for (let emotionName in emotions) {
    const emotionVal = parseInt(emotions[emotionName] * 10) / 1000;
    if (emotionVal > emotionThreshold) {
      emotions[emotionName] = emotionVal;
    } else {
      emotions[emotionName] = 0;
    }
  }

  return emotions;
}

function getSumEmotionsFromEmotionsHistory(emotionsHistory) {
  const sumEmotions = {};
  const historyLength = emotionsHistory.length;

  emotionsHistory.map(datum => {
    for (let emotion in datum) {
      if (emotion in sumEmotions !== true) {
        sumEmotions[emotion] = 0;
      }

      sumEmotions[emotion] += datum[emotion];
    }
  });

  return sumEmotions;
}

function getRawAvgEmotionsFromSumEmotions(sumEmotions) {
  const rawAvgEmotions = [];

  for (let emotionName in sumEmotions) {
    const avgEmotionVal =
      parseInt(sumEmotions[emotionName] / videoEmotionsHistory.length * 100) /
      100;
    rawAvgEmotions.push({
      name: emotionName,
      val: avgEmotionVal
    });
  }

  return rawAvgEmotions;
}

function getNormalizedAverageEmotions(emotions) {
  console.log('emotionsPreNormalization', emotions);
  const totalEmotionsVal = emotions.reduce(
    (sum, current) => sum + current.val,
    0
  );

  // console.log(totalEmotionsVal);

  const normalizedEmotions = {};

  emotions.map(emotion => {
    if (totalEmotionsVal > 0) {
      const normalizedEmotionVal =
        parseInt(emotion.val / totalEmotionsVal * 100) / 100;

      normalizedEmotions[emotion.name] = normalizedEmotionVal || 0;
    } else {
      normalizedEmotions[emotion.name] = 0;
    }
  });

  return normalizedEmotions;
}

function getAverageEmotionsFromVideoHistory() {
  if (videoEmotionsHistory.length === 0) return null;
  const sumEmotions = getSumEmotionsFromEmotionsHistory(videoEmotionsHistory);
  // console.log('sumEmotions', sumEmotions);
  const rawAvgEmotions = getRawAvgEmotionsFromSumEmotions(sumEmotions);
  // console.log('rawAvgEmotions', rawAvgEmotions);
  const normalizedEmotions = getNormalizedAverageEmotions(rawAvgEmotions);
  // console.log('normalizedEmotions', normalizedEmotions);
  return normalizedEmotions;
}

function rememberVideoEmotions(emotions) {
  videoEmotionsHistory.push(emotions);
}

function resetVideoEmotionsHistory() {
  videoEmotionsHistory = [];
}

function getDominantSentimentFromNormalizedVals(normalizedVal) {
  if (normalizedVal < -1 * neutralityThreshold) {
    return 'negative';
  } else if (normalizedVal < neutralityThreshold) {
    return 'neutral';
  } else {
    return 'positive';
  }
}

exports.getVideoEmotionsObj = getVideoEmotionsObj;
exports.getFormattedTextSentiment = getFormattedTextSentiment;
exports.getAverageEmotionsFromVideoHistory = getAverageEmotionsFromVideoHistory;
exports.rememberVideoEmotions = rememberVideoEmotions;
exports.resetVideoEmotionsHistory = resetVideoEmotionsHistory;
exports.getDominantSentimentFromNormalizedVals = getDominantSentimentFromNormalizedVals;
exports.getNormalizedVideoSentiment = getNormalizedVideoSentiment;
