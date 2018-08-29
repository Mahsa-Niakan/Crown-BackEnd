'use strict';
const app = require('../server/server');
const moment = require('moment');

const TAG = '#utils: ';
exports.getServerTime = function() {
  // let d = new Date();
  // return d;
  let currentTimeStamp = moment().format();
  return currentTimeStamp;
};

exports.getUTCServerTime = function() {
  // let d = new Date();
  // return d;
  let currentTimeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.000');
  return currentTimeStamp  + 'Z';
};
