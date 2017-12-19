const Promise = require('bluebird');
const NProgress = require('nprogress');

const audio = require('./_audio');
const video = require('./_video');
const screensaver = require('./_screensaver');
const chat = require('./_chat');
const chart = require('./_chart');

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

const $audioAnalysisSection = $('#audio-analysis-wrap');
// const $audioAnalysisWrap = $('#audio-analysis');
const audioChartWrapId = 'audio-emotions-chart-wrap';
// const $audioChartWrap = $(audioChartWrapId);

let userTextTimeout = null;

function asyncInit() {
  return video
    .asyncSetupCamera($cameraRoot)
    .then(audio.asyncSetupAudio)
    .then(video.startWatching)
    .then(() => {
      chart.setupCharts(videoChartWrapId, audioChartWrapId);
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

  $userText.text(text);
}

function setAudioAnalysis(html = '') {
  if (html === '') {
    hideSection('audio-analysis-wrap');
  } else {
    showSection('audio-analysis-wrap');
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
  NProgress.start();
  return;
}

function endProgress() {
  NProgress.done();
  return;
}

function setConversationStageStart() {
  hideSections(['video-analysis-wrap', 'audio-analysis-wrap']);
  resetSections(['video-analysis', 'audio-analysis']);

  setUserText();
  setBotText('Say hello to start a conversation with Emobot');
}

function setConversationStageFeelings() {
  // hideSections(['video-analysis-wrap', 'audio-analysis-wrap']);
  // resetSections('video-analysis', 'audio-analysis');
  // setUserText();
  // setBotText("");
}

function setConversationStage(stage) {
  switch (stage) {
    case 'start':
      setConversationStageStart();
      break;
    case 'feelings':
      setConversationStageFeelings();
      break;
    case 'joke':
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

function processVideoEmotions(emotionsObj) {
  showSection('video-analysis-wrap');
  chart.updateVideoData(emotionsObj);
  // const videoEmotionAnalysisHtml = getVideoEmotionAnalysisHtml(emotionsObj);
  // ui.setVideoAnalysis(videoEmotionAnalysisHtml);
}

exports.asyncInit = asyncInit;
exports.setVideoStatus = setVideoStatus;
exports.setAudioStatus = setAudioStatus;
// exports.setVideoAnalysis = setVideoAnalysis;
// exports.setAudioAnalysis = setAudioAnalysis;
exports.processVideoEmotions = processVideoEmotions;
exports.showSection = showSection;
exports.hideSection = hideSection;
exports.setBotText = setBotText;
exports.setUserText = setUserText;
exports.startProgress = startProgress;
exports.endProgress = endProgress;
exports.setConversationStage = setConversationStage;
exports.getVideoEmotionAnalysisHtml = getVideoEmotionAnalysisHtml;
