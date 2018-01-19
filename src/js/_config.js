module.exports = {
  audio: {
    volThreshold: 10,
    detectAudioInterval: 500,
    waitAfterVolumeLength: 0.5 * 1000,
    ambientListeningWindowLength: 15 * 1000
  },
  chart: {
    width: 300,
    height: 300
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
      surprise: {
        color: 'mediumpurple'
      },
      positive: {
        color: 'green'
      },
      negative: {
        color: 'red'
      }
    }
  },
  chat: {
    defaultScreensaverTimeoutLength: 2 * 60 * 1000,
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
  screensaver: {
    videoWrapperId: 'video-wrap',
    videoPlayingClass: 'video-playing'
  }
};
