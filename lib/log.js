const axios = require('axios');
const qs = require('qs');

axios.defaults.headers.common['Authorization'] = process.env.SECRET;

function asyncSaveReaction(reactionObj) {
  return axios({
    url: process.env.LOG_URL,
    method: 'POST',
    data: qs.stringify(reactionObj)
  });
}

exports.asyncSaveReaction = asyncSaveReaction;
