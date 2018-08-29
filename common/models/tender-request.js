'use strict';
const app = require('../../server/server');
const utils = require('../utils.js');
module.exports = function(Tenderrequest) {
  Tenderrequest.remoteMethod('addNewTenderRequest', {
    description: 'Add A New tenderRequest By Member',
    notes: ['{"tenderId":"1","picture":"string",' +
    '"tenderRequestDetails":"string","tenderRequestPriceFee":"1",' +
    '"tenderRequestPriceTotal":"1",' +
    '"tenderRequestState":" ","tenderRequestCity":" "}'],
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
  Tenderrequest.addNewTenderRequest = function(options, inputObject, cb) {
    const TAG = 'addNewTenderRequest: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Tender Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const Tender = app.models.Tender;

    let userId = ownerId;
    let tenderId = inputObject.tenderId;
    let picture = inputObject.picture;
    let tenderRequestDetails = inputObject.tenderRequestDetails;
    let tenderRequestPriceFee = inputObject.tenderRequestPriceFee;
    let tenderRequestPriceTotal = inputObject.tenderRequestPriceTotal;
    var moment = require('jalali-moment');
    let tenderRequestRegisterDate = moment(utils.getUTCServerTime(),
      'YYYY-MM-DDTHH:mm:ss.000Z')
      .locale('fa').format('YYYY-MM-DDTHH:mm:ss.000Z');
    let tenderRequestState = inputObject.tenderRequestState;
    let tenderRequestCity = inputObject.tenderRequestCity;
    let tenderRequestIsDeleted = false;
    let newTenderRequestObject = {
      appUserId: userId,
      tenderId: tenderId,
      picture: picture,
      tenderRequestDetails: tenderRequestDetails,
      tenderRequestPriceFee: tenderRequestPriceFee,
      tenderRequestPriceTotal: tenderRequestPriceTotal,
      tenderRequestState: tenderRequestState,
      tenderRequestCity: tenderRequestCity,
      tenderRequestRegisterDate: tenderRequestRegisterDate,
      tenderRequestIsDeleted: tenderRequestIsDeleted,
    };

    // check if category exists
    Tender.findById(tenderId, {},
      function(error, selectedTender) {
        if (error) {
          return cb(error);
        }
        if (selectedTender !== null) {
          addTenderRequest();
        } else {
          let err = new Error('selected Tender not found');
          err.name = 'NewTenderRequestError';
          err.status = 404;
          return cb(err);
        }
      });
    function addTenderRequest() {
      Tenderrequest.create(newTenderRequestObject,
        function(error, newTenderRequest) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewTenderRequestInfo: ' +
            JSON.stringify(newTenderRequest));
          returnResponse();
          function returnResponse() {
            Tenderrequest.findById(newTenderRequest.id,
              {}, function(error, newTenderRequestResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newTenderRequestResponse);
              });
          }
        });
    };
  };
  Tenderrequest.remoteMethod('updateTenderRequest', {
    description: 'Update TenderRequest',
    notes: ['{"tenderRequestId":1,' +
    '"tenderRequestDetails":"tenderRequestDetails",' +
    '"tenderRequestPriceFee":1,' +
    '"tenderRequestPriceTotal":1,"tenderRequestState":" ",' +
    '"tenderRequestCity":" ","picture":" "}'],
    accepts: [
      {arg: 'options', type: 'object', 'http': 'optionsFromRequest'},
      {
        arg: 'inputObject', type: 'object',
        required: true, http: {source: 'body'},
      },
    ],
    returns: {
      arg: 'accessToken', type: 'object', root: true,
      description: 'User Model',
    },
    http: {verb: 'post'},
  }
  );
  Tenderrequest.updateTenderRequest = function(options, inputObject, cb) {
    const TAG = '#updateTenderRequest: ';

    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    // let AppUser = app.models.AppUser;
    let ownerId = options.accessToken.userId;
    let tenderRequestId = inputObject.tenderRequestId;
    let tenderRequestDetails = inputObject.tenderRequestDetails;
    let tenderRequestPriceFee = inputObject.tenderRequestPriceFee;
    let tenderRequestPriceTotal = inputObject.tenderRequestPriceTotal;
    let tenderRequestState = inputObject.tenderRequestState;
    let tenderRequestCity = inputObject.tenderRequestCity;
    let picture = inputObject.picture;
    console.log(TAG + tenderRequestId);
    if (tenderRequestDetails === undefined ||
      tenderRequestPriceTotal === undefined ||
      tenderRequestState === undefined || tenderRequestCity === undefined) {
      let error = new Error('no tenderRequestDetails or' +
        ' tenderRequestPriceTotal or Location field provided!');
      error.name = 'Update TenderRequest Information Error';
      return cb(error);
    }

    Tenderrequest.findById(tenderRequestId, {},
      function(error, tenderRequest) {
        if (error) {
          return cb(error);
        }
        if (tenderRequest !== null) {
          let updateFilter = {where: {tenderRequestId: tenderRequestId}};
          let updateObject = {
            tenderRequestDetails: tenderRequestDetails,
            tenderRequestPriceFee: tenderRequestPriceFee,
            tenderRequestPriceTotal: tenderRequestPriceTotal,
            tenderRequestState: tenderRequestState,
            tenderRequestCity: tenderRequestCity,
            picture: picture,
          };
          tenderRequest.updateAttributes(updateObject,
            function(error, updatedInformation) {
              if (error) {
                return cb(error);
              }
              returnResult();
            });
        }
      });

    function returnResult() {
      Tenderrequest.findById(tenderRequestId, {},
        function(error, updatedInfo) {
          console.log(TAG + 'TenderRequest Updated: ',
            JSON.stringify(updatedInfo));
          return cb(null, updatedInfo);
        });
    }
  };
  Tenderrequest.remoteMethod('getYourTenderRequests', {
    description: 'Returns users TenderRequests',
    notes: [''],
    accepts: [
      {arg: 'options', type: 'object', 'http': 'optionsFromRequest'}],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Tenderrequest.getYourTenderRequests = function(options, cb) {
    const TAG = '#getYourTenderRequests: ';
    // console.log(TAG + "Called!");
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;

    let filter = {
      where: {appUserId: ownerId, isDeleted: false},
      include: ['tender'],
    };

    Tenderrequest.find(filter, function(error, userTenderRequests) {
      if (error) {
        return cb(error);
      }
      return cb(null, userTenderRequests);
    });
  };
};
