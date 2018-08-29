'use strict';
const utils = require('../utils.js');
module.exports = function(Util) {
  Util.getServerTime = function(cb) {
    const TAG = '#getServerTime: ';
    let responseObject = {
      serverTime: utils.getServerTime(),
      utcServerTime: utils.getUTCServerTime(),
    };
    cb(null, responseObject);
  };

  Util.remoteMethod('getServerTime', {
    description: 'Returns Server Time',
    notes: [''],
    accepts: [],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
};

