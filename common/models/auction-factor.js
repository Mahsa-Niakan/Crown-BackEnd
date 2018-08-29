'use strict';
const utils = require('../utils.js');
const app = require('../../server/server');
module.exports = function(Auctionfactor) {
  Auctionfactor.addNewAuctionFactor = function(options, inputObject, cb) {
    const TAG = 'addNewAuctionFactor: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const auctionPackage = app.models.AuctionPackage;

    let userId = ownerId;
    let auctionPackageId = inputObject.auctionPackageId;
    let isDeleted = false;
    let isActive = true;
    let details = '.';
    let traceCode = '.';
    var moment = require('jalali-moment');
    let registerDate = moment(utils.getUTCServerTime(),
      'YYYY-MM-DDTHH:mm:ss.000Z')
      .locale('fa').format('YYYY-MM-DDTHH:mm:ss.000Z');
    let expireDate = 1;
    let newAuctionFactorObject = {
      appUserId: userId,
      auctionPackageId: auctionPackageId,
      isActive: isActive,
      isDeleted: isDeleted,
      Details: details,
      traceCode: traceCode,
      expireDate: expireDate,
      registerDate: registerDate,
    };

    // check if category exists
    auctionPackage.findById(auctionPackageId, {},
      function(error, selectedAuctionPackage) {
        if (error) {
          return cb(error);
        }
        if (selectedAuctionPackage !== null) {
          addAuctionFactor();
        } else {
          let err = new Error('selected AuctionPackage not found');
          err.name = 'NewAuctionFactorError';
          err.status = 404;
          return cb(err);
        }
      });

    function addAuctionFactor() {
      Auctionfactor.create(newAuctionFactorObject,
        function(error, newAuctionFactor) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewAuctionFactorInfo: ' +
            JSON.stringify(newAuctionFactor));
          returnResponse();
          function returnResponse() {
            Auctionfactor.findById(newAuctionFactor.id,
              {}, function(error, newAuctionFactorResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newAuctionFactorResponse);
              });
          }
        });
    };
  };
  Auctionfactor.remoteMethod('addNewAuctionFactor', {
    description: 'Add A New AuctionFactor By Member',
    notes: ['{"auctionPackageId":1}'],
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
};
