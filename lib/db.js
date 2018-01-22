const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs-extra');

const config = require('./config');

// make sure save directory exists before trying to put db file there
// if (!fs.existsSync(config.savePath)) {
//   fs.mkdirSync(config.savePath);
// }

const adapter = new FileSync(config.dbPath);
const db = low(adapter);

exports.initializeDb = () => {
  db
    .defaults({
      generatedPhrases: [],
      jokeRatings: []
    })
    .write();
};

exports.addPhrase = phraseObj => {
  db
    .get('generatedPhrases')
    .push(phraseObj)
    .write();
};

exports.findPhrase = searchObj => {
  return db
    .get('generatedPhrases')
    .find(searchObj)
    .value();
};

function makeSureJokeIsInDb(text) {
  const dbJoke = db
    .get('jokeRatings')
    .find({
      text: text
    })
    .value();

  if (!dbJoke) {
    // joke is not in db, add
    db
      .get('jokeRatings')
      .push({
        text: text,
        ratings: {
          positive: 0,
          neutral: 0,
          negative: 0
        }
      })
      .write();
  }
}

exports.logJokeReaction = (text, reaction) => {
  makeSureJokeIsInDb(text);

  const dbJoke = db.get('jokeRatings').find({
    text: text
  });

  const jokeVal = dbJoke.value();
  jokeVal.ratings[reaction.name]++;

  dbJoke.assign(jokeVal).write();
};
