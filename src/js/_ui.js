const Promise = require('bluebird');

const audio = require('./_audio');
const video = require('./_video');
const screensaver = require('./_screensaver');
const chat = require('./_chat');
const chart = require('./_chart');

const $inProgress = $('.in-progress');

const $convoIntro = $('#convo-intro');
const $convoMain = $('#convo-main');
const $preloading = $('#preloading');

const $pageStatusSection = $('#page-status-wrap');
const $videoStatus = $('#video-status');
const $audioStatus = $('#audio-status');

const $videoAnalysisSection = $('#video-analysis-wrap');
// const $videoAnalysisWrap = $('#video-analysis');
const videoChartWrapId = 'video-emotions-chart-wrap';
// const $videoChartWrap = $(videoChartWrapId);

const $cameraSection = $('#camera-wrap');
const $cameraRoot = $('#camera-root');

const $botTextSection = $('#bot-text-wrap');
const $botText = $('#bot-text');

const $userTextSection = $('#user-text-wrap');
const $userText = $('#user-text');

const $textAnalysisSection = $('#text-analysis-wrap');
// const $audioAnalysisWrap = $('#audio-analysis');
const textChartWrapId = 'text-sentiment-chart-wrap';
// const $audioChartWrap = $(textChartWrapId);

let userTextTimeout = null;

function getConvoStage() {
  if ($convoMain.is(':visible')) {
    return 'main';
  } else if ($convoIntro.is(':visible')) {
    return 'intro';
  } else {
    return 'loading';
  }
}

function showConvoMain() {
  $preloading.hide();
  $convoIntro.hide();
  $convoMain.show();
}

function showConvoIntro() {
  $preloading.hide();
  $convoMain.hide();
  $convoIntro.show();
}

function asyncInit() {
  return video
    .asyncSetupCamera($cameraRoot)
    .then(audio.asyncSetupAudio)
    .then(video.startWatching)
    .then(() => {
      chart.setupCharts(videoChartWrapId, textChartWrapId);
    });
}

function setVideoStatus(status = '') {
  $videoStatus.text(status);
}
function setAudioStatus(status = '') {
  $audioStatus.text(status);
}

function setVideoAnalysis(html = '') {
  if (html === '') {
    hideSection('video-analysis-wrap');
  } else {
    showSection('video-analysis-wrap');
  }
  $videoAnalysisWrap.html(html);
}

function setBotText(text = '') {
  if (text === '') {
    hideSection('bot-text-wrap');
  } else {
    showSection('bot-text-wrap');
  }
  $botText.text(text);
}
function setUserText(text = '') {
  clearTimeout(userTextTimeout);

  if (text === '') {
    hideSection('user-text-wrap');
  } else {
    showSection('user-text-wrap');

    // reset user text after certain amount of time
    const timeoutMsPerChar = 200; // adjust?
    setTimeout(setUserText, text.length * 200, '');
  }

  if (text !== '') {
    $userText.text(`"${text}"`);
  } else {
    $userText.text('');
  }
}

function setAudioAnalysis(html = '') {
  if (html === '') {
    hideSection('text-analysis-wrap');
  } else {
    showSection('text-analysis-wrap');
  }
  $audioAnalysisWrap.html(html);
}

function showSection(sectionName) {
  $(`#${sectionName}`).fadeIn();
}

function hideSection(sectionName) {
  $(`#${sectionName}`).fadeOut();
}

function showSections(sectionNames) {
  sectionNames.map(sectionName => showSection(sectionName));
}

function hideSections(sectionNames) {
  sectionNames.map(sectionName => hideSection(sectionName));
}

function hideAnalysisSections() {
  hideSections(['video-analysis-wrap', 'text-analysis-wrap']);
}

function resetSection(sectionName) {
  switch (sectionName) {
    case 'video-analysis':
      // setVideoAnalysis();
      break;
    case 'audio-analysis':
      // setAudioAnalysis();
      break;
    case 'bot-text':
      setBotText();
      break;
    case 'user-text':
      setUserText();
      break;
    default:
      console.log('cannot reset unknown section', sectionName);
      break;
  }
}

function resetSections(sectionNames) {
  sectionNames.map(sectionName => resetSection(sectionName));
}

function startProgress() {
  console.log('start progress');
  $inProgress.css('visibility', 'visible');
}

function endProgress() {
  console.log('end progress');
  $inProgress.css('visibility', 'hidden');
}

function setConversationStageStart() {
  showConvoIntro();
  // showConvoMain(); // remove!
  hideSections(['video-analysis-wrap', 'text-analysis-wrap']);
  resetSections(['video-analysis', 'audio-analysis']);

  setUserText();
  setBotText('Say hello to start a conversation with Emobot');
  audio.startListening();
}

function setConversationStageFeelings() {
  // hideSections(['video-analysis-wrap', 'text-analysis-wrap']);
  // resetSections('video-analysis', 'audio-analysis');
  // setUserText();
  // setBotText("");
}

function setConversationStageJokeAsk() {}
function setConversationStageJoke() {}

function setConversationStage(stage) {
  switch (stage) {
    case 'start':
      setConversationStageStart();
      break;
    case 'feelings':
      setConversationStageFeelings();
      break;
    case 'joke-ask':
      setConversationStageJokeAsk();
    case 'joke':
      setConversationStageJoke();
      break;
      break;
    case 'ad':
      break;
    case 'end':
      break;
    default:
      console.log('cannot set unknown conversation stage', stage);
      break;
  }
}

function getVideoEmotionAnalysisHtml(emotionsObj) {
  let html = '<ul>';
  for (let emotion in emotionsObj) {
    html += `<li>${emotion}: ${parseInt(emotionsObj[emotion] * 100)}%`;
  }
  html += '</ul>';
  return html;
}

exports.asyncInit = asyncInit;
exports.setVideoStatus = setVideoStatus;
exports.setAudioStatus = setAudioStatus;
exports.showSection = showSection;
exports.hideSection = hideSection;
exports.setBotText = setBotText;
exports.setUserText = setUserText;
exports.startProgress = startProgress;
exports.endProgress = endProgress;
exports.setConversationStage = setConversationStage;
exports.getVideoEmotionAnalysisHtml = getVideoEmotionAnalysisHtml;
exports.hideAnalysisSections = hideAnalysisSections;
exports.showConvoIntro = showConvoIntro;
exports.showConvoMain = showConvoMain;
exports.getConvoStage = getConvoStage;
