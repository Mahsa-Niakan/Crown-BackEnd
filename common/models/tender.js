'use strict';
const utils = require('../utils.js');
const app = require('../../server/server');
module.exports = function(Tender) {
  Tender.remoteMethod('addNewTender', {
    description: 'Add A New Tender By Member',
    notes: ['{"tenderTitle":"a","tenderDetails":" ",' +
    '"tenderPic1":" ","tenderPic2":" ","tenderPic3":" ",' +
    '"tenderQuantity":1,"tenderState":" ","tenderCity":" ",' +
    '"tenderExpireDate":1,"tenderTransfer":false,"CategoryId":1}'],
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
  Tender.addNewTender = function(options, inputObject, cb) {
    const TAG = 'addNewTender: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const Category = app.models.Category;

    let userId = ownerId;
    let categoryId = inputObject.CategoryId;
    let isDeleted = false;
    let isActive = false;
    let tenderDetails = inputObject.tenderDetails;
    let tenderTitle = inputObject.tenderTitle;
    var moment = require('jalali-moment');
    let registerDate = moment(utils.getUTCServerTime(),
      'YYYY-MM-DDTHH:mm:ss.000Z')
      .locale('fa').format('YYYY-MM-DDTHH:mm:ss.000Z');
    let expireDate = inputObject.tenderExpireDate;
    let tenderPic1 = inputObject.tenderPic1;
    let tenderPic2 = inputObject.tenderPic2;
    let tenderPic3 = inputObject.tenderPic3;
    let tenderQuantity = inputObject.tenderQuantity;
    let tenderState = inputObject.tenderState;
    let tenderCity = inputObject.tenderCity;
    let tenderTransfer = inputObject.tenderTransfer;
    let newTenderObject = {
      appUserId: userId,
      categoryId: categoryId,
      isActive: isActive,
      isDeleted: isDeleted,
      tenderDetails: tenderDetails,
      tenderTitle: tenderTitle,
      tenderExpireDate: expireDate,
      tenderRegisterDate: registerDate,
      tenderPic1: tenderPic1,
      tenderPic2: tenderPic2,
      tenderPic3: tenderPic3,
      tenderQuantity: tenderQuantity,
      tenderState: tenderState,
      tenderCity: tenderCity,
      tenderTransfer: tenderTransfer,
    };

    // check if category exists
    Category.findById(categoryId, {},
      function(error, selectedCategory) {
        if (error) {
          return cb(error);
        }
        if (selectedCategory !== null) {
          addTender();
        } else {
          let err = new Error('selected Category not found');
          err.name = 'NewTenderError';
          err.status = 404;
          return cb(err);
        }
      });

    function addTender() {
      Tender.create(newTenderObject,
        function(error, newTender) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewTenderInfo: ' +
            JSON.stringify(newTender));
          returnResponse();
          function returnResponse() {
            Tender.findById(newTender.id,
              {}, function(error, newTenderResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newTenderResponse);
              });
          }
        });
    };
  };
  Tender.remoteMethod('getYourTenders', {
    description: 'Returns users Tenders',
    notes: [''],
    accepts: [
      {arg: 'options', type: 'object', 'http': 'optionsFromRequest'}],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Tender.getYourTenders = function(options, cb) {
    const TAG = '#getYourTenders: ';
    // console.log(TAG + "Called!");
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;

    let filter = {
      where: {appUserId: ownerId, isDeleted: false, isActive: true},
      include: ['category'],
    };

    Tender.find(filter, function(error, userTendedrs) {
      if (error) {
        return cb(error);
      }
      return cb(null, userTendedrs);
    });
  };
  Tender.remoteMethod('getYourOtherTenderRequests', {
    description: 'Returns users Other Tender Requests',
    notes: [''],
    accepts: [
      {arg: 'options', type: 'object', 'http': 'optionsFromRequest'}],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Tender.getYourOtherTenderRequests = function(options, cb) {
    const TAG = '#getYourOtherTenderRequests: ';
    // console.log(TAG + "Called!");
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;

    let filter = {
      where: {appUserId: ownerId, isDeleted: false},
      include: ['tenderRequests'],
    };

    Tender.find(filter, function(error, userTendedrs) {
      if (error) {
        return cb(error);
      }
      return cb(null, userTendedrs);
    });
  };
  Tender.remoteMethod('getTendersByCategoryId', {
    description: 'Get Tenders By Category Id',
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
  Tender.getTendersByCategoryId = function(searchObject, cb) {
    const TAG = '#getTendersByCategoryId: ';
    // console.log(TAG + "Called!");

    let categoryId = searchObject.categoryId;
    let filter = {
      where: {categoryId: categoryId, isDeleted: false, isActive: true},
      include: ['category'],
    };

    Tender.find(filter, function(error, Tenders) {
      if (error) {
        return cb(error);
      }
      return cb(null, Tenders);
    });
  };
  Tender.remoteMethod('getTendersByState', {
    description: 'Get Tenders By State',
    notes: ['{"tenderState": ""}'],
    accepts: [{
      arg: 'searchObject',
      type: 'object',
      http: {source: 'query'},
      description: '{"tenderState": ""}',
    }],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Tender.getTendersByState = function(searchObject, cb) {
    const TAG = '#getTendersByState: ';
    // console.log(TAG + "Called!");

    let state = searchObject.tenderState;
    let filter = {
      where: {tenderState: state, tenderIsDeleted: false, tenderIsActive: true},
      include: ['category'],
    };

    Tender.find(filter, function(error, Tenders) {
      if (error) {
        return cb(error);
      }
      return cb(null, Tenders);
    });
  };
  Tender.remoteMethod('getTendersByCity', {
    description: 'Get Tenders By City',
    notes: ['{"tenderCity": ""}'],
    accepts: [{
      arg: 'searchObject',
      type: 'object',
      http: {source: 'query'},
      description: '{"tenderCity": ""}',
    }],
    http: {verb: 'get'},
    returns: {type: 'Object', root: 'true', description: 'Single Request'},
  });
  Tender.getTendersByCity = function(searchObject, cb) {
    const TAG = '#getTendersByCity: ';
    // console.log(TAG + "Called!");

    let city = searchObject.tenderCity;
    let filter = {
      where: {tenderCity: city, tenderIsDeleted: false, tenderIsActive: true},
      include: ['category'],
    };

    Tender.find(filter, function(error, Tenders) {
      if (error) {
        return cb(error);
      }
      return cb(null, Tenders);
    });
  };
};
