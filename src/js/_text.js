const _ = require('lodash');
const utils = require('./_utils');
const emotions = require('./_emotions');

function formatNameStr(nameStr) {
  let lowerStr = _.toLower(nameStr);
  lowerStr = lowerStr.replace(`my name is`, '');
  lowerStr = lowerStr.replace(`my name's`, '');
  return lowerStr;
}

function getComparisonFeelingText(videoEmotions, textSentiment) {
  const normalizedTextSentiment = utils.mapRange(textSentiment, 0, 1, -1, 1); // -1 for negative, 0 for neutral, 1 for positive

  let normalizedVideoSentiment = 0;
  for (let i = 0; i < videoEmotions.length; i++) {
    if (videoEmotions[i].name === 'joy')
      normalizedVideoSentiment += videoEmotions[i].val;
    if (videoEmotions[i].name === 'sadness')
      normalizedVideoSentiment -= videoEmotions[i].val;
  }
  // normalizedVideoSentiment is now [-1, 1]

  // compare video with text analysis
  const dominantVideoSentiment = emotions.getDominantSentimentFromNormalizedVals(
    normalizedVideoSentiment
  );
  const dominantTextSentiment = emotions.getDominantSentimentFromNormalizedVals(
    normalizedTextSentiment
  );
  console.log(dominantVideoSentiment, dominantTextSentiment);

  // I don't really love this approach but it works for now
  switch ([dominantVideoSentiment, dominantTextSentiment].join(' ')) {
    case 'positive positive':
      return `Wow, that's exactly what I sensed. According to both text and video analysis, it sounds like you're feeling good. You're pretty self aware!`;
      break;
    case 'positive neutral':
      return `Even though my text analysis of your response is fairly neutral, my video analysis shows that you're feeling good. Nice!`;
      break;
    case 'positive negative':
      return `Interesting. My video analysis shows that you're feeling good but my text analysis tends toward the negative. Are you trying to fool me?`;
      break;
    case 'neutral positive':
      return `My video analysis of your response is fairly neutral, but my text analysis of your response is positive. Are you trying to talk yourself into being happy? (Just kidding).`;
      break;
    case 'neutral neutral':
      return `Boring day, huh? Both my video and text analysis of your response are fairly neutral. At least you're consistent!`;
      break;
    case 'neutral negative':
      return `My video analysis of your response is fairly neutral, but my text analysis of your response is negative. Not trying to cry at work, huh?`;
      break;
    case 'negative positive':
      return `Interesting. My text analysis indicates a positive response, but my video analysis shows the opposite! Trying to talk yourself into being happy? (Just kidding).`;
      break;
    case 'negative neutral':
      return `Even though my text analysis of your response is fairly neutral, my video analysis shows that you aren't feeling so hot. Hope your day gets better!`;
      break;
    case 'negative negative':
      return `Bummer! Both my video and text analysis of your response turn up negative. At least you're consistent! Cheer up, friend.`;
      break;
  }

  return '';
}

exports.formatNameStr = formatNameStr;
exports.getComparisonFeelingText = getComparisonFeelingText;
