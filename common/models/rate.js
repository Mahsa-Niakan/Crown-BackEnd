'use strict';
const app = require('../../server/server');
module.exports = function(Rate) {
  Rate.remoteMethod('addNewRate', {
    description: 'Add A New Rate By Member',
    notes: ['{"customer":1,"comment":" ","likes":2,"type":"Mozayede"}'],
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
  Rate.addNewRate = function(options, inputObject, cb) {
    const TAG = 'addNewRate: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const user = app.models.AppUser;

    let userId = ownerId;
    let comment = inputObject.comment;
    let likes = inputObject.likes;
    let customer = inputObject.customer;
    let type = inputObject.type;
    let newRateObject = {
      userId: userId,
      comment: comment,
      likes: likes,
      customer: customer,
      type: type,
    };
    user.findById(customer, {},
      function(error, selectedUser) {
        if (error) {
          return cb(error);
        }
        if (selectedUser !== null) {
          addRate();
        } else {
          let err = new Error('selected User not found');
          err.name = 'NewRateError';
          err.status = 404;
          return cb(err);
        }
      });

    function addRate() {
      Rate.create(newRateObject,
        function(error, newRate) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewRateInfo: ' +
            JSON.stringify(newRate));
          returnResponse();
          function returnResponse() {
            Rate.findById(newRate.id,
              {}, function(error, newRateResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newRateResponse);
              });
          }
        });
    };
  };
};
