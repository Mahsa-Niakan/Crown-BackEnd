'use strict';
const utils = require('../utils.js');
const app = require('../../server/server');
module.exports = function(Tenderfactor) {
  Tenderfactor.remoteMethod('addNewTenderFactor', {
    description: 'Add A New TenderFactor By Member',
    notes: ['{"tenderPackageId":1}'],
    accepts: [
        {arg: 'options', type: 'object', 'http': 'optionsFromRequest'},
      {arg: 'inputObject', type: 'object',
        required: true, http: {source: 'body'}},
    ],
    returns: {
      arg: 'accessToken', type: 'object', root: true,
      description: 'User Model',
    },
    http: {verb: 'post'},
  }
  );
  Tenderfactor.addNewTenderFactor = function(options, inputObject, cb) {
    const TAG = 'addNewTenderFactor: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const tenderPackage = app.models.TenderPackage;

    let userId = ownerId;
    let tenderPackageId = inputObject.tenderPackageId;
    let isDeleted = false;
    let isActive = true;
    let details = '.';
    let traceCode = '.';
    var moment = require('jalali-moment');
    let registerDate = moment(utils.getUTCServerTime(),
      'YYYY-MM-DDTHH:mm:ss.000Z')
      .locale('fa').format('YYYY-MM-DDTHH:mm:ss.000Z');
    let expireDate = 1;
    let newTenderFactorObject = {
      appUserId: userId,
      tenderPackageId: tenderPackageId,
      isActive: isActive,
      isDeleted: isDeleted,
      Details: details,
      traceCode: traceCode,
      expireDate: expireDate,
      registerDate: registerDate,
    };

    // check if category exists
    tenderPackage.findById(tenderPackageId, {},
      function(error, selectedTenderPackage) {
        if (error) {
          return cb(error);
        }
        if (selectedTenderPackage !== null) {
          addTenderFactor();
        } else {
          let err = new Error('selected TenderPackage not found');
          err.name = 'NewTenderFactorError';
          err.status = 404;
          return cb(err);
        }
      });

    function addTenderFactor() {
      Tenderfactor.create(newTenderFactorObject,
        function(error, newTenderFactor) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewTenderFactorInfo: ' +
          JSON.stringify(newTenderFactor));
          returnResponse();
          function returnResponse() {
            Tenderfactor.findById(newTenderFactor.id,
              {}, function(error, newTenderFactorResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newTenderFactorResponse);
              });
          }
        });
    };
  };
};
