'use strict';
const app = require('../../server/server');
const utils = require('../utils.js');
module.exports = function(Auctionrequest) {
  Auctionrequest.remoteMethod('addNewAuctionRequest', {
    description: 'Add A New auctionRequest By Member',
    notes: ['{"auctionId":"1",' +
      '"auctionRequestDetails":"string","auctionRequestPriceFee":"1",' +
      '"auctionRequestPriceTotal":"1",' +
      '"auctionRequestState":" ","auctionRequestCity":" "}'],
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
  Auctionrequest.addNewAuctionRequest = function(options, inputObject, cb) {
    const TAG = 'addNewAuctionRequest: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Auction Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const Auction = app.models.Auction;

    let userId = ownerId;
    let auctionId = inputObject.auctionId;
    let auctionRequestDetails = inputObject.auctionRequestDetails;
    let auctionRequestPriceFee = inputObject.auctionRequestPriceFee;
    let auctionRequestPriceTotal = inputObject.auctionRequestPriceTotal;
    var moment = require('jalali-moment');
    let auctionRequestRegisterDate = moment(utils.getUTCServerTime(),
      'YYYY-MM-DDTHH:mm:ss.000Z')
      .locale('fa').format('YYYY-MM-DDTHH:mm:ss.000Z');
    let auctionRequestState = inputObject.auctionRequestState;
    let auctionRequestCity = inputObject.auctionRequestCity;
    let auctionRequestIsDeleted = false;
    let newAuctionRequestObject = {
      appUserId: userId,
      auctionId: auctionId,
      auctionRequestDetails: auctionRequestDetails,
      auctionRequestPriceFee: auctionRequestPriceFee,
      auctionRequestPriceTotal: auctionRequestPriceTotal,
      auctionRequestState: auctionRequestState,
      auctionRequestCity: auctionRequestCity,
      auctionRequestRegisterDate: auctionRequestRegisterDate,
      auctionRequestIsDeleted: auctionRequestIsDeleted,
    };

    // check if category exists
    Auction.findById(auctionId, {},
      function(error, selectedAuction) {
        if (error) {
          return cb(error);
        }
        if (selectedAuction !== null) {
          addAuctionRequest();
        } else {
          let err = new Error('selected Auction not found');
          err.name = 'NewAuctionRequestError';
          err.status = 404;
          return cb(err);
        }
      });

    function addAuctionRequest() {
      Auctionrequest.create(newAuctionRequestObject,
        function(error, newAuctionRequest) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewAuctionRequestInfo: ' +
            JSON.stringify(newAuctionRequest));
          returnResponse();

          function returnResponse() {
            Auctionrequest.findById(newAuctionRequest.id,
              {}, function(error, newAuctionRequestResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newAuctionRequestResponse);
              });
          }
        });
    };
  };
  Auctionrequest.remoteMethod('updateAuctionRequest', {
    description: 'Update AuctionRequest',
    notes: ['{"auctionRequestId":1,' +
      '"auctionRequestDetails":"auctionRequestDetails",' +
      '"auctionRequestPriceFee":1,' +
      '"auctionRequestPriceTotal":1,"auctionRequestState":" ",' +
      '"auctionRequestCity":" "}'],
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
  Auctionrequest.updateAuctionRequest = function(options, inputObject, cb) {
    const TAG = '#updateAuctionRequest: ';

    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    // let AppUser = app.models.AppUser;
    let ownerId = options.accessToken.userId;
    let auctionRequestId = inputObject.auctionRequestId;
    let auctionRequestDetails = inputObject.auctionRequestDetails;
    let auctionRequestPriceFee = inputObject.auctionRequestPriceFee;
    let auctionRequestPriceTotal = inputObject.auctionRequestPriceTotal;
    let auctionRequestState = inputObject.auctionRequestState;
    let auctionRequestCity = inputObject.auctionRequestCity;
    console.log(TAG + auctionRequestId);
    if (auctionRequestDetails === undefined ||
      auctionRequestPriceTotal === undefined ||
      auctionRequestState === undefined || auctionRequestCity === undefined) {
      let error = new Error('no auctionRequestDetails or' +
        ' auctionRequestPriceTotal or Location field provided!');
      error.name = 'Update AuctionRequest Information Error';
      return cb(error);
    }

    Auctionrequest.findById(auctionRequestId, {},
    function(error, auctionRequest) {
      if (error) {
        return cb(error);
      }
      if (auctionRequest !== null) {
        let updateFilter = {where: {auctionRequestId: auctionRequestId}};
        let updateObject = {
          auctionRequestDetails: auctionRequestDetails,
          auctionRequestPriceFee: auctionRequestPriceFee,
          auctionRequestPriceTotal: auctionRequestPriceTotal,
          auctionRequestState: auctionRequestState,
          auctionRequestCity: auctionRequestCity,
        };
        auctionRequest.updateAttributes(updateObject,
          function(error, updatedInformation) {
            if (error) {
              return cb(error);
            }
            returnResult();
          });
      }
    });

    function returnResult() {
      Auctionrequest.findById(auctionRequestId, {},
        function(error, updatedInfo) {
          console.log(TAG + 'AuctionRequest Updated: ',
            JSON.stringify(updatedInfo));
          return cb(null, updatedInfo);
        });
    }
  };
  Auctionrequest.remoteMethod('getYourAuctionRequests', {
    description: 'Returns users AuctionRequests',
    notes: [''],
    accepts: [
      {arg: 'options', type: 'object', 'http': 'optionsFromRequest'}],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Auctionrequest.getYourAuctionRequests = function(options, cb) {
    const TAG = '#getYourAuctionRequests: ';
    // console.log(TAG + "Called!");
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;

    let filter = {
      where: {appUserId: ownerId, isDeleted: false},
      include: ['auction'],
    };

    Auctionrequest.find(filter, function(error, userAuctionRequests) {
      if (error) {
        return cb(error);
      }
      return cb(null, userAuctionRequests);
    });
  };
};
