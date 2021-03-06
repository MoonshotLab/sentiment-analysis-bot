const _ = require('lodash');

const utils = require('./_utils');
const emotions = require('./_emotions');
const config = require('./_config');

function formatNameStr(nameStr) {
  let lowerStr = _.toLower(nameStr);
  lowerStr = lowerStr.replace(`my name is`, '');
  lowerStr = lowerStr.replace(`my name's`, '');
  lowerStr = lowerStr.replace(`i'm`, '');
  lowerStr = lowerStr.replace(`i am`, '');
  lowerStr = lowerStr.replace(`call me`, '');
  return lowerStr;
}

function containsWakeWord(str = '') {
  const lowerStr = _.toLower(str);
  const wakeWords = ['hello', 'hi', 'start', 'begin', 'yo'];

  for (let i = 0; i < wakeWords.length; i++) {
    if (lowerStr.indexOf(wakeWords[i]) !== -1) return true;
  }

  return false;
}

function getComparisonFeelingText(videoEmotions, textSentiment) {
  // console.log('videoEmotions before', videoEmotions);
  // console.log('textSentiment before', videoEmotions);
  const [normalizedVideoSentiment, normalizedTextSentiment] = [
    emotions.getNormalizedVideoSentiment(videoEmotions),
    textSentiment.val
  ];

  // console.log('normalizedVideoSentiment', normalizedVideoSentiment);
  // console.log('normalizedTextSentiment', normalizedTextSentiment);

  // compare video with text analysis
  const [dominantVideoSentiment, dominantTextSentiment] = [
    emotions.getDominantSentimentFromNormalizedVals(normalizedVideoSentiment),
    textSentiment.name
  ];

  console.log(normalizedVideoSentiment, normalizedTextSentiment);
  console.log(dominantVideoSentiment, dominantTextSentiment);

  // I don't really love this approach but it works for now
  switch ([dominantVideoSentiment, dominantTextSentiment].join(' ')) {
    case 'positive positive':
      return `Wow, that's exactly what I sensed. According to both text and video analysis, it sounds like you're feeling good. You're pretty self aware!`;
      break;
    case 'positive neutral':
      return `Although my text analysis of your response is fairly neutral, my video analysis shows that you're feeling good. Nice!`;
      break;
    case 'positive negative':
      return `Interesting. My video analysis shows that you're feeling good but my text analysis leans to the negative. You're a tricky one.`;
      break;
    case 'neutral positive':
      return `My video analysis of your response is fairly neutral, but my text analysis of your response is positive. Are you trying to fool yourself? (Just kidding).`;
      break;
    case 'neutral neutral':
      return `Boring day, huh? Both my video and text analysis of your response are fairly neutral. At least you're consistent!`;
      break;
    case 'neutral negative':
      return `My video analysis of your response is fairly neutral, but my text analysis of your response is negative. Rough day, huh?`;
      break;
    case 'negative positive':
      return `Interesting. My text analysis indicates a positive response, but my video analysis shows the opposite! Trying to talk yourself into being happy? (Just kidding).`;
      break;
    case 'negative neutral':
      return `Although my text analysis of your response is fairly neutral, my video analysis shows that you're feeling a little down. Hope your day gets better!`;
      break;
    case 'negative negative':
      return `Bummer! Both my video and text analysis of your response turn up negative. At least you're consistent! That's something to feel positive about.`;
      break;
  }

  return '';
}

function getComparisonJokeText(videoEmotions, textSentiment) {
  const normalizedVideoSentiment = emotions.getNormalizedVideoSentiment(
    videoEmotions
  );
  const normalizedTextSentiment = textSentiment.val; // sentiment is already [-1, 1]

  // compare video with text analysis
  const [dominantVideoSentiment, dominantTextSentiment] = [
    emotions.getDominantSentimentFromNormalizedVals(normalizedVideoSentiment),
    emotions.getDominantSentimentFromNormalizedVals(normalizedTextSentiment)
  ];

  console.log(normalizedVideoSentiment, normalizedTextSentiment);
  console.log(dominantVideoSentiment, dominantTextSentiment);

  // I don't really love this approach but it works for now
  switch ([dominantVideoSentiment, dominantTextSentiment].join(' ')) {
    case 'positive positive':
      return `I'm a hit! According to both my video and text analysis, you liked my joke. Nice!`;
      break;
    case 'positive neutral':
      return `Even though my text analysis of your response is fairly neutral, my video analysis shows that you liked it more than you say. Are you holding out on me?`;
      break;
    case 'positive negative':
      return `Hmm... Even though my text analysis of your response turns up negative, my video analysis shows otherwise. Are you lying to me?`;
      break;
    case 'neutral positive':
      return `My video analysis of your response is fairly neutral, but my text analysis of your response is positive. You wouldn't lie to me, would you?`;
      break;
    case 'neutral neutral':
      return `Rats, looks like I'm a flop. Both my analysis of your text and visual response turn up neutral. I'll have to try a different joke next time.`;
      break;
    case 'neutral negative':
      return `My video analysis of your response is fairly neutral, but my text analysis of your response is negative. You wouldn't lie to me, would you?`;
      break;
    case 'negative positive':
      return `Interesting. My text analysis indicates a positive response, but my video analysis shows the opposite! Are you trying not to hurt my feelings? Don't worry, I can take it.`;
      break;
    case 'negative neutral':
      return `Even though my text analysis of your response is fairly neutral, my video analysis turns up negative. Looks like I should try a different joke next time.`;
      break;
    case 'negative negative':
      return `Bummer! Both my video and text analysis of your response turn up negative. At least you're consistent! I'll try a different joke next time.`;
      break;
  }

  return '';
}

function getRandomJoke() {
  const jokes = [
    `What time did the man go to the dentist? Tooth hurt-ee.`,
    `A ham sandwich walks into a bar and orders a beer. Bartender says, 'Sorry we don't serve food here.'`,
    `How do you make holy water? You boil the hell out of it.`,
    `A three-legged dog walks into a bar and says to the bartender, 'I'm looking for the man who shot my paw.'`,
    `What did the Buddhist say to the hot dog vendor? Make me one with everything.`,
    `Why did the chicken cross the playground? To get to the other slide.`,
    `Why did the football coach shake the vending machine? Because he needed a quarterback.`,
    `I'm reading a book about anti-gravity. It's impossible to put down!`,
    `I just watched a documentary about beavers. It was the best dam show I ever saw!`,
    `I bought some shoes from a drug dealer. I don't know what he laced them with, but I was tripping all day!`,
    `Why do chicken coops only have two doors? Because if they had four, they would be chicken sedans!`,
    `What do you call a cow with two legs? Lean beef. If the cow has no legs, then it’s ground beef.`,
    `I’m only familiar with 25 letters in the English language. I don’t know why.`,
    `Why couldn't the bike standup by itself? It was two tired.`,
    `What do you call a dog that can do magic? A Labracadabrador.`,
    `Why didn't the vampire attack Taylor Swift? She had bad blood.`,
    `Why can't you hear a pterodactyl go to the bathroom? Because the pee is silent.`,
    `You heard of that new band 1023MB? They're good but they haven't got a gig yet.`,
    `What's the best part about living in Switzerland? I don't know, but the flag is a big plus.`,
    `How many tickles does it take to make an octopus laugh? Ten-tickles.`,
    `What do you call a factory that sells passable products? A satisfactory.`
  ];

  return utils.randomPick(jokes);
}

exports.formatNameStr = formatNameStr;
exports.getComparisonFeelingText = getComparisonFeelingText;
exports.getRandomJoke = getRandomJoke;
exports.getComparisonJokeText = getComparisonJokeText;
exports.containsWakeWord = containsWakeWord;
