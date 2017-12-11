const $body = $('body');
const $videoWrapper = $('#video-wrap');
const $video = $videoWrapper.find('video');
const video = $video[0];

let activated = false;

const videoPlayingClass = 'video-playing';

function playVideo() {
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
}

function stop() {
  console.log('stopping screensaver');
  stopVideo();
  $body.removeClass(videoPlayingClass);
  activated = false;
}

function isActivated() {
  return activated;
}

exports.start = start;
exports.stop = stop;
exports.isActivated = isActivated;
