const config = require('./_config');
const audio = require('./_audio');

const $body = $('body');
const $videoWrapper = $(`#${config.screensaver.videoWrapperId}`);
const $video = $videoWrapper.find('video');
const video = $video[0];

let activated = false;
let screensaverTimeout = null;

const videoPlayingClass = config.screensaver.videoPlayingClass;

function playVideo() {
  video.loop = true;
  video.play();
}

function pauseVideo() {
  video.pause();
}

function stopVideo() {
  pauseVideo();
  video.currentTime = 0;
}

function start() {
  console.log('starting screensaver');
  playVideo();
  $body.addClass(videoPlayingClass);
  activated = true;
  audio.stopListening();
}

function stop() {
  console.log('stopping screensaver');
  stopVideo();
  $body.removeClass(videoPlayingClass);
  activated = false;
  audio.startListening();
}

function isActivated() {
  return activated;
}

function keepAwake(timeoutLength, awakeCb, sleepCb) {
  console.log('keepalive');
  if (isActivated()) {
    stop();
    awakeCb();
  }

  clearTimeout(screensaverTimeout);
  screensaverTimeout = setTimeout(sleepCb, timeoutLength);
}

exports.start = start;
exports.stop = stop;
exports.isActivated = isActivated;
exports.keepAwake = keepAwake;
