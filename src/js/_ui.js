const Promise = require('bluebird');
const NProgress = require('nprogress');

const audio = require('./_audio');
const video = require('./_video');

const $pageStatusSection = $('#page-status-wrap');
const $videoStatus = $('#video-status');
const $audioStatus = $('#audio-status');

const $videoAnalysisSection = $('#video-analysis-wrap');
const $videoAnalysisWrap = $('#video-analysis');

const $cameraSection = $('#camera-wrap');
const $cameraRoot = $('#camera-root');

const $botTextSection = $('#bot-text-wrap');
const $botText = $('#bot-text');

const $userTextSection = $('#user-text-wrap');
const $userText = $('#user-text');

const $audioAnalysisSection = $('#audio-analysis-wrap');
const $audioAnalysisWrap = $('#audio-analysis');

function asyncInit() {
  return video
    .asyncSetupCamera($cameraRoot)
    .then(audio.asyncSetupAudio)
    .then(video.startWatching);
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
  if (text === '') {
    hideSection('user-text-wrap');
  } else {
    showSection('user-text-wrap');
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

function getSectionByName(sectionName = null) {
  if (sectionName === null) {
    console.log('Must provide section name to show');
    return null;
  }

  switch (sectionName) {
    case 'video-analysis':
      return $videoAnalysisWrap;
      break;
    case 'audio-analysis':
      return $audioAnalysisWrap;
      break;
    case 'bot-text':
      return $botTextSection;
      break;
    case 'user-text':
      return $userTextSection;
      break;
    default:
      return null;
      break;
  }
}

function showSection(sectionName) {
  $(`#${sectionName}`).fadeIn();
}

function hideSection(sectionName) {
  $(`#${sectionName}`).fadeOut();
}

function startProgress() {
  NProgress.start();
  return;
}

function endProgress() {
  NProgress.done();
  return;
}

exports.asyncInit = asyncInit;
exports.setVideoStatus = setVideoStatus;
exports.setAudioStatus = setAudioStatus;
exports.setVideoAnalysis = setVideoAnalysis;
exports.setAudioAnalysis = setAudioAnalysis;
exports.showSection = showSection;
exports.hideSection = hideSection;
exports.setBotText = setBotText;
exports.setUserText = setUserText;
exports.startProgress = startProgress;
exports.endProgress = endProgress;
