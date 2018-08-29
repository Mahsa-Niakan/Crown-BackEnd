'use strict';
const utils = require('../utils.js');
const app = require('../../server/server');
module.exports = function(Auction) {
  Auction.remoteMethod('addNewAuction', {
    description: 'Add A New Auction By Member',
    notes: ['{"auctionTitle":"a","auctionDetails":" ",' +
      '"auctionPic1":" ","auctionPic2":" ","auctionPic3":" ",' +
      '"auctionQuantity":1,"auctionState":" ","auctionCity":" ",' +
      '"auctionExpireDate":1,"auctionTransfer":false,"CategoryId":1,' +
    '"minPrice":0}'],
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
  Auction.addNewAuction = function(options, inputObject, cb) {
    const TAG = 'addNewAuction: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Auction Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const Category = app.models.Category;

    let userId = ownerId;
    let categoryId = inputObject.CategoryId;
    let auctionIsDeleted = false;
    let auctionIsActive = false;
    let auctionDetails = inputObject.auctionDetails;
    let auctionTitle = inputObject.auctionTitle;
    let minPrice = inputObject.minPrice;
    var moment = require('jalali-moment');
    let registerDate = moment(utils.getUTCServerTime(),
      'YYYY-MM-DDTHH:mm:ss.000Z')
      .locale('fa').format('YYYY-MM-DDTHH:mm:ss.000Z');
    let expireDate = inputObject.auctionExpireDate;
    let auctionPic1 = inputObject.auctionPic1;
    let auctionPic2 = inputObject.auctionPic2;
    let auctionPic3 = inputObject.auctionPic3;
    let auctionQuantity = inputObject.auctionQuantity;
    let auctionState = inputObject.auctionState;
    let auctionCity = inputObject.auctionCity;
    let auctionTransfer = inputObject.auctionTransfer;
    let newAuctionObject = {
      appUserId: userId,
      categoryId: categoryId,
      auctionIsActive: auctionIsActive,
      auctionIsDeleted: auctionIsDeleted,
      auctionDetails: auctionDetails,
      auctionTitle: auctionTitle,
      auctionExpireDate: expireDate,
      auctionRegisterDate: registerDate,
      auctionPic1: auctionPic1,
      auctionPic2: auctionPic2,
      auctionPic3: auctionPic3,
      auctionQuantity: auctionQuantity,
      auctionState: auctionState,
      auctionCity: auctionCity,
      auctionTransfer: auctionTransfer,
      minPrice: minPrice,
    };

    // check if category exists
    Category.findById(categoryId, {},
      function(error, selectedCategory) {
        if (error) {
          return cb(error);
        }
        if (selectedCategory !== null) {
          addAuction();
        } else {
          let err = new Error('selected Category not found');
          err.name = 'NewAuctionError';
          err.status = 404;
          return cb(err);
        }
      });

    function addAuction() {
      Auction.create(newAuctionObject,
        function(error, newAuction) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewAuctionInfo: ' +
            JSON.stringify(newAuction));
          returnResponse();
          function returnResponse() {
            Auction.findById(newAuction.id,
              {}, function(error, newAuctionResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newAuctionResponse);
              });
          }
        });
    };
  };
  Auction.remoteMethod('getYourAuctions', {
    description: 'Returns users Auctions',
    notes: [''],
    accepts: [
      {arg: 'options', type: 'object', 'http': 'optionsFromRequest'}],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Auction.getYourAuctions = function(options, cb) {
    const TAG = '#getYourAuctions: ';
    // console.log(TAG + "Called!");
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;

    let filter = {
      where: {appUserId: ownerId,
        auctionIsDeleted: false, auctionIsActive: true},
      include: ['category'],
    };

    Auction.find(filter, function(error, userAuctions) {
      if (error) {
        return cb(error);
      }
      return cb(null, userAuctions);
    });
  };
  Auction.remoteMethod('getYourOtherAuctionRequests', {
    description: 'Returns users Other Auction Requests',
    notes: [''],
    accepts: [
      {arg: 'options', type: 'object', 'http': 'optionsFromRequest'}],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Auction.getYourOtherAuctionRequests = function(options, cb) {
    const TAG = '#getYourOtherAuctionRequests: ';
    // console.log(TAG + "Called!");
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;

    let filter = {
      where: {appUserId: ownerId, auctionIsDeleted: false},
      include: ['auctionRequests'],
    };

    Auction.find(filter, function(error, userAuctions) {
      if (error) {
        return cb(error);
      }
      return cb(null, userAuctions);
    });
  };
  Auction.remoteMethod('getAuctionsByCategoryId', {
    description: 'Get Auctions By Category Id',
    notes: ['{"categoryId": 10}'],
    accepts: [{
      arg: 'searchObject',
      type: 'object',
      http: {source: 'query'},
      description: '{"categoryId": 10}',
    }],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Auction.getAuctionsByCategoryId = function(searchObject, cb) {
    const TAG = '#getAuctionsByCategoryId: ';
    // console.log(TAG + "Called!");

    let categoryId = searchObject.categoryId;
    let filter = {
      where: {categoryId: categoryId,
        auctionIsDeleted: false, auctionIsActive: true},
      include: ['category'],
    };

    Auction.find(filter, function(error, Auctions) {
      if (error) {
        return cb(error);
      }
      return cb(null, Auctions);
    });
  };
  Auction.remoteMethod('getAuctionsByState', {
    description: 'Get Auctions By State',
    notes: ['{"auctionState": ""}'],
    accepts: [{
      arg: 'searchObject',
      type: 'object',
      http: {source: 'query'},
      description: '{"auctionState": ""}',
    }],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Auction.getAuctionsByState = function(searchObject, cb) {
    const TAG = '#getAuctionsByState: ';
    // console.log(TAG + "Called!");

    let state = searchObject.auctionState;
    let filter = {
      where: {auctionState: state,
        auctionIsDeleted: false, auctionIsActive: true},
      include: ['category'],
    };

    Auction.find(filter, function(error, Auctions) {
      if (error) {
        return cb(error);
      }
      return cb(null, Auctions);
    });
  };
  Auction.remoteMethod('getAuctionsByCity', {
    description: 'Get Auction By City',
    notes: ['{"auctionCity": ""}'],
    accepts: [{
      arg: 'searchObject',
      type: 'object',
      http: {source: 'query'},
      description: '{"auctionCity": ""}',
    }],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Auction.getAuctionsByCity = function(searchObject, cb) {
    const TAG = '#getAuctionsByCity: ';
    // console.log(TAG + "Called!");

    let city = searchObject.auctionCity;
    let filter = {
      where: {auctionCity: city,
        auctionIsDeleted: false, auctionIsActive: true},
      include: ['category'],
    };

    Auction.find(filter, function(error, Auctions) {
      if (error) {
        return cb(error);
      }
      return cb(null, Auctions);
    });
  };
};
