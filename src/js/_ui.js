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

const $textAnalysisSection = $('#text-analysis-wrap');
// const $audioAnalysisWrap = $('#audio-analysis');
const textChartWrapId = 'text-sentiment-chart-wrap';
// const $audioChartWrap = $(textChartWrapId);

const volChartWrapId = 'vol-chart-wrap';

const $cameraSection = $('#camera-wrap');
const $cameraRoot = $('#camera-root');

const $botSpeakingSection = $('#bot-speaking-wrap');
const $botSpeaking = $('#bot-speaking'); // img

const $botTextSection = $('#bot-text-wrap');
const $botText = $('#bot-text');

const $userTextSection = $('#user-text-wrap');
const $userText = $('#user-text');

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
  audio.startListening();
  $preloading.hide();
  $convoIntro.hide();
  $convoMain.show();
}

function showConvoIntro() {
  audio.stopListening();
  $preloading.hide();
  $convoMain.hide();
  $convoIntro.show();
}

function showPreloading() {
  audio.stopListening();
  $convoIntro.hide();
  $convoMain.hide();
  $preloading.show();
}

function showCameraFeed(fade = false) {
  if (fade === true) {
    $cameraSection.fadeIn();
  } else {
    $cameraSection.show();
  }
}

function hideCameraFeed(fade = false) {
  if (fade === true) {
    $cameraSection.fadeOut();
  } else {
    $cameraSection.hide();
  }
}

function asyncInit() {
  return video
    .asyncSetupCamera($cameraRoot)
    .then(audio.asyncSetupAudio)
    .then(video.startWatching)
    .then(() => {
      chart.setupCharts(videoChartWrapId, textChartWrapId, volChartWrapId);
    });
}

function setVideoStatus(status = '') {
  $videoStatus.text(status);
}
function setAudioStatus(status = '') {
  $audioStatus.text(status);
}

function showBotSpeaking() {
  $botSpeaking.addClass('speaking');
}

function hideBotSpeaking() {
  $botSpeaking.removeClass('speaking');
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
  // showConvoMain(); // fix remove!
  hideCameraFeed();
  hideCharts();

  setUserText();
  audio.startListening();
}

function setConversationStageFeelings() {
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
    case 'ad':
      break;
    case 'end':
      break;
    default:
      console.log('cannot set unknown conversation stage', stage);
      break;
  }
}

function showCharts(fade = false) {
  if (fade === true) {
    $videoAnalysisSection.fadeIn();
    $textAnalysisSection.fadeIn();
  } else {
    $videoAnalysisSection.show();
    $textAnalysisSection.show();
  }
}

function hideCharts(fade = false) {
  if (fade === true) {
    $videoAnalysisSection.fadeOut();
    $textAnalysisSection.fadeOut();
  } else {
    $videoAnalysisSection.hide();
    $textAnalysisSection.hide();
  }
}

function showVideoChart(fade = true) {
  if (fade === true) {
    $videoAnalysisSection.fadeIn();
  } else {
    $videoAnalysisSection.show();
  }
}

function showTextChart(fade = true) {
  if (fade === true) {
    $textAnalysisSection.fadeIn();
  } else {
    $textAnalysisSection.show();
  }
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
exports.showConvoIntro = showConvoIntro;
exports.showConvoMain = showConvoMain;
exports.getConvoStage = getConvoStage;
exports.hideCharts = hideCharts;
exports.showCharts = showCharts;
exports.showPreloading = showPreloading;
exports.showVideoChart = showVideoChart;
exports.showTextChart = showTextChart;
exports.showCameraFeed = showCameraFeed;
exports.hideCameraFeed = hideCameraFeed;
exports.showBotSpeaking = showBotSpeaking;
exports.hideBotSpeaking = hideBotSpeaking;
