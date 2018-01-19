const Promise = require('bluebird');

const chat = require('./_chat');
const ui = require('./_ui');
const config = require('./_config');
const chart = require('./_chart');

// let audioEmotions = [];
const emotionThreshold = 0.1;

let videoEmotionsHistory = [];

const emotionsMap = config.emotions.emotionsMap;

function getEmotionColorByName(emotionName) {
  if (emotionName in emotionsMap) return emotionsMap[emotionName].color;
  throw new Error('unknown emotion', emotionName);
}

function getFormattedTextSentiment(sentimentScore) {
  console.log('sentiment score', sentimentScore);
  sentimentScore = parseInt(sentimentScore * 10) / 10;

  const formattedScore = [];
  let sentimentRating = null;

  if (sentimentScore < 0.4) {
    sentimentRating = 'negative';
  } else if (sentimentScore < 0.6) {
    sentimentRating = 'neutral';
  } else {
    sentimentRating = 'positive';
  }

  return {
    name: sentimentRating,
    val: sentimentScore,
    color: getEmotionColorByName(sentimentRating)
  };
}

// function getAudioEmotionsArray(emotionsObj) {
//   const emotionsArray = [];
//
//   for (let emotionName in emotionsObj) {
//     const emotionVal = parseInt(emotionsObj[emotionName] * 100) / 100;
//     if (emotionVal > emotionThreshold) {
//       emotionsArray.push({
//         name: emotionName,
//         val: emotionVal,
//         color: getEmotionColorByName(emotionName)
//       });
//     }
//   }
//
//   if (emotionsArray.length === 0) {
//     return [
//       {
//         name: 'neutral',
//         val: 0.5,
//         color: getEmotionColorByName('neutral')
//       }
//     ];
//   } else {
//     return emotionsArray;
//   }
// }

function getVideoEmotionsObj(facesInfo) {
  if (facesInfo.length == 0) return null;

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

function clearVideoEmotions() {
  videoEmotions = [];
}

// function getAudioEmotions() {
//   return audioEmotions;
// }

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
      val: avgEmotionVal,
      color: getEmotionColorByName(emotionName)
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

  console.log(totalEmotionsVal);

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
  console.log('videoEmotionsHistory', videoEmotionsHistory);
  if (videoEmotionsHistory.length === 0) return null;
  const sumEmotions = getSumEmotionsFromEmotionsHistory(videoEmotionsHistory);
  console.log('sumEmotions', sumEmotions);
  const rawAvgEmotions = getRawAvgEmotionsFromSumEmotions(sumEmotions);
  console.log('rawAvgEmotions', rawAvgEmotions);
  const normalizedEmotions = getNormalizedAverageEmotions(rawAvgEmotions);
  console.log('normalizedEmotions', normalizedEmotions);
  return normalizedEmotions;
}

function rememberVideoEmotions(emotions) {
  videoEmotionsHistory.push(emotions);
}

function resetVideoEmotionsHistory() {
  videoEmotionsHistory = [];
}

function getDominantSentimentFromNormalizedVals(normalizedVal) {
  const threshold = 0.25;
  if (normalizedVal < -1 * threshold) {
    return 'negative';
  } else if (normalizedVal < threshold) {
    return 'neutral';
  } else {
    return 'positive';
  }
}

// exports.getVideoEmotionAnalysisHtml = getVideoEmotionAnalysisHtml;
exports.getVideoEmotionsObj = getVideoEmotionsObj;
exports.getFormattedTextSentiment = getFormattedTextSentiment;
// exports.getAudioEmotionsArray = getAudioEmotionsArray
exports.clearVideoEmotions = clearVideoEmotions;
exports.getAverageEmotionsFromVideoHistory = getAverageEmotionsFromVideoHistory;
exports.rememberVideoEmotions = rememberVideoEmotions;
exports.resetVideoEmotionsHistory = resetVideoEmotionsHistory;
exports.getDominantSentimentFromNormalizedVals = getDominantSentimentFromNormalizedVals;
