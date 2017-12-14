module.exports = {
  audio: {
    volThreshold: 25,
    detectAudioInterval: 500,
    waitAfterVolumeLength: 0.5 * 1000,
    ambientListeningWindowLength: 15 * 1000
  },
  chart: {
    width: 500,
    height: 225
  },
  emotions: {
    emotionsMap: {
      neutral: {
        color: 'darkgray'
      },
      anger: {
        color: 'red'
      },
      joy: {
        color: 'yellow'
      },
      sadness: {
        color: 'blue'
      },
      fear: {
        color: 'black'
      },
      surprise: {
        color: 'mediumpurple'
      }
    }
  },
  chat: {
    defaultScreensaverTimeoutLength: 30 * 1000,
    conversationMap: {
      start: {
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
  screensaver: {
    videoWrapperId: 'video-wrap',
    videoPlayingClass: 'video-playing'
  }
};
