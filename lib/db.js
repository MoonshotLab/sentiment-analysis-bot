const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs-extra');

const config = require('./config');

// make sure save directory exists before trying to put db file there
if (!fs.existsSync(config.savePath)) {
  fs.mkdirSync(config.savePath);
}

const adapter = new FileSync(config.dbPath);
const db = low(adapter);

exports.initializeDb = () => {
  db
    .defaults({
      generatedPhrases: []
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
