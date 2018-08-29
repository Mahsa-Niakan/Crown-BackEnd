'use strict';
const app = require('../../server/server');
module.exports = function(Bookmarktender) {
  Bookmarktender.remoteMethod('addNewBookmarktender', {
    description: 'Add A New Bookmarktender By Member',
    notes: ['{"tenderId":"1"}'],
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
  Bookmarktender.addNewBookmarktender = function(options, inputObject, cb) {
    const TAG = 'addNewBookmarktender: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Tender Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const Tender = app.models.Tender;

    let userId = ownerId;
    let tenderId = inputObject.tenderId;
    let newBookmarktenderObject = {
      appUserId: userId,
      tenderId: tenderId,
    };

    // check if category exists
    Tender.findById(tenderId, {},
      function(error, selectedTender) {
        if (error) {
          return cb(error);
        }
        if (selectedTender !== null) {
          addBookMarkTender();
        } else {
          let err = new Error('selected Tender not found');
          err.name = 'NewBookMarkTenderError';
          err.status = 404;
          return cb(err);
        }
      });
    function addBookMarkTender() {
      Bookmarktender.create(newBookmarktenderObject,
        function(error, newBookmarktender) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewBookmarktenderInfo: ' +
            JSON.stringify(newBookmarktender));
          returnResponse();
          function returnResponse() {
            Bookmarktender.findById(newBookmarktender.id,
              {}, function(error, newBookmarktenderResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newBookmarktenderResponse);
              });
          }
        });
    };
  };
};

