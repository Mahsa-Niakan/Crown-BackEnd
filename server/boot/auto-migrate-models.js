'use strict';

var app = require('../server');
var ds = app.dataSources.kalaagh;

var models = [];
// models.push('AppUser');
// models.push('Tender');
// models.push('Auction');
// models.push('AuctionFactor');
// models.push('TenderRequest');
// models.push('AuctionRequest');
// models.push('Message');
// models.push('Rate');
// models.push('TenderPackage');
// models.push('AuctionPackage');
// models.push('Category');
// models.push('BookMarkAuction');
// models.push('BookMarkTender');
// models.push('TenderRequest');
// models.push('TenderFactor');
// models.push('AccessToken');
// models.push('ACL');
// models.push('RoleMapping');
// models.push('Role');
// models.push('Product');
// models.push('Category');
// models.push('ProductHistory');
// models.push('Receipt');
// models.push('ProductInReceipt');
// models.push('BuyerInformation');
ds.automigrate(models, function() {
  ds.discoverModelProperties('TenderFactor', function(err, props) {
    console.log(props);
  });
});
