module.exports = {
  audio: {
    volThreshold: 15,
    detectAudioInterval: 200,
    waitAfterVolumeLength: 0.5 * 1000,
    ambientListeningWindowLength: 15 * 1000
  },
  chart: {
    width: 350,
    height: 275
  },
  chat: {
    defaultScreensaverTimeoutLength: 60 * 1000,
    repeatTimeoutLength: 10 * 1000,
    conversationMap: {
      start: {
        next: 'name'
      },
      name: {
        next: 'feelings'
      },
      feelings: {
        next: 'joke'
      },
      // jokeAsk: {
      //   next: 'joke'
      // },
      joke: {
        next: 'ad'
      },
      ad: {
        next: 'end'
      },
      end: {
        next: 'start'
      }
    }
  },
  emotions: {
    neutralityThreshold: 0.3
  },
  screensaver: {
    videoWrapperId: 'video-wrap',
    videoPlayingClass: 'video-playing'
  }
};
