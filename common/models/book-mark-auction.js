'use strict';
const app = require('../../server/server');
module.exports = function(Bookmarkauction) {
  Bookmarkauction.remoteMethod('addNewBookmarkauction', {
    description: 'Add A New Bookmarkauction By Member',
    notes: ['{"auctionId":"1"}'],
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
  Bookmarkauction.addNewBookmarkauction = function(options, inputObject, cb) {
    const TAG = 'addNewBookmarkauction: ';
    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Auction Error';
      return cb(error);
    }
    let ownerId = options.accessToken.userId;
    const Auction = app.models.Auction;

    let userId = ownerId;
    let auctionId = inputObject.auctionId;
    let newBookmarkauctionObject = {
      appUserId: userId,
      auctionId: auctionId,
    };

    // check if category exists
    Auction.findById(auctionId, {},
      function(error, selectedAuction) {
        if (error) {
          return cb(error);
        }
        if (selectedAuction !== null) {
          addBookMarkAuction();
        } else {
          let err = new Error('selected Auction not found');
          err.name = 'NewBookMarkAuctionError';
          err.status = 404;
          return cb(err);
        }
      });
    function addBookMarkAuction() {
      Bookmarkauction.create(newBookmarkauctionObject,
        function(error, newBookmarkauction) {
          if (error) {
            return cb(error);
          }
          console.log(TAG + 'addNewBookmarkauctionInfo: ' +
            JSON.stringify(newBookmarkauction));
          returnResponse();
          function returnResponse() {
            Bookmarkauction.findById(newBookmarkauction.id,
              {}, function(error, newBookmarkauctionResponse) {
                if (error) {
                  return cb(error);
                }
                cb(null, newBookmarkauctionResponse);
              });
          }
        });
    };
  };
};
