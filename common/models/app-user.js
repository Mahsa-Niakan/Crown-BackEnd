'use strict';
const utils = require('../utils.js');
const app = require('../../server/server');
const moment = require('moment');
module.exports = function(Appuser) {
  Appuser.registerMember = function(RegisterObject, cb) {
    const TAG = '#registerMember: ';
    // var Role = app.models.Role;
    let RoleMapping = app.models.RoleMapping;
    let username = RegisterObject.username;
    let password = RegisterObject.password;
    let roleId = 5;   // Member role id

    if (username === undefined || password === undefined) {
      let error = new Error('username or password is not set!');
      error.name = 'register error';
      return cb(error);
    }
   // let mDate =  Date();
    var moment = require('jalali-moment');
   // moment().format();
    let credentials = {
      username: username,
      password: password,
      email: 's' + username + '@shop.com',
      userRegisterDate: moment(utils.getUTCServerTime(),
        'YYYY-MM-DDTHH:mm:ss.000Z')
        .locale('fa').format('YYYY-MM-DDTHH:mm:ss.000Z'),
    };

    let userId;
    Appuser.findOne({where: {username: username},
      include: ['roles']}, function(error, appUser) {
      if (appUser === null) {
        // console.log(TAG, 1);

        // create user
        Appuser.create(credentials, function(error, newUser) {
          if (error) {
            return cb(null, error);
          }
          userId = newUser.id;
          let roleMappingObject = [{
            principalType: RoleMapping.USER,
            principalId: newUser.id,
            roleId: roleId,
          }];

          RoleMapping.create(roleMappingObject, function(error, principal) {
            if (error) {
              return cb(null, error);
            }
            // console.log(TAG +'newUser: ', JSON.stringify(newUser));
            returnResult();
          });
        });
      } else {
        // console.log(TAG, 2);
        // userId = appUser.id;
        // returnResult();
        // return cb(null, {status: 'error', message: 'this user has already created before!'})
        let error = new Error('this user has already created before!');
        error.name = 'register error';
        return cb(error);
      }

      function returnResult() {
        Appuser.findById(userId, {include: ['roles']},
          function(error, cbNewUser) {
            console.log(TAG + 'Member Created: ', JSON.stringify(cbNewUser));
            return cb(null, cbNewUser);
          });
      }
    });
  };
  Appuser.remoteMethod('registerMember', {
    description: 'Register New Member',
    notes: ['{"username":"username","password":"password",' +
    '"userRegisterDate":"userRegisterDate"}'],
    accepts: {
      arg: 'RegisterObject',
      type: 'object',
      required: true,
      http: {source: 'body'},
    },
    returns: {
      type: 'object',
      root: true,
      description: 'Member Registered!',
    },
    http: {
      verb: 'post',
    },
  }
  );
  Appuser.remoteMethod('loginMember', {
    description: 'Login method for Member',
    notes: ['{"username":"username","password":"password"}'],
    accepts: {arg: 'loginObject',
      type: 'object', required: true, http: {source: 'body'}},
    returns: {
      arg: 'accessToken', type: 'object', root: true,
      description: 'User Model',
    },
    http: {verb: 'post'},
  }
  );
  Appuser.loginMember = function(loginObject, cb) {
    const TAG = 'loginMember: ';

    let username = loginObject.username;
    let password = loginObject.password;

    if (username === undefined || password === undefined) {
      // return cb(null, {status: 'error', message: 'username or password is not set!'})
      let error = new Error('username or password is not set!');
      error.name = 'login error';
      return cb(error);
    }

    let credentials = {username: username, password: password};

    Appuser.login(credentials, null, function(error, loginInfo) {
      if (error) {
        return cb(error);
      }
      console.log(TAG + 'loginMember Info: ' + JSON.stringify(loginInfo));
      cb(null, loginInfo);
    });
  };
  Appuser.remoteMethod('updateAppUser', {
    description: 'Update AppUser',
    notes: ['{"username":"username","password":"123",' +
    '"name":"sarina","companyName":" ",' +
    '"secondPhone":" ","appUserState":" ","appUserCity":" ",' +
    '"profilePhoto":" "}'],
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
  Appuser.updateAppUser = function(options, inputObject, cb) {
    const TAG = '#updateAppUser: ';

    if (options.accessToken === null) {
      let error = new Error('no token provided!');
      error.name = 'Access Token Error';
      return cb(error);
    }
    // let AppUser = app.models.AppUser;
    let ownerId = options.accessToken.userId;
    let userName = inputObject.username;
    let password = inputObject.password;
    let name = inputObject.name;
    let companyName = inputObject.companyName;
    let secondPhone = inputObject.secondPhone;
    let appUserState = inputObject.appUserState;
    let appUserCity = inputObject.appUserCity;
    let profilePhoto = inputObject.profilePhoto;
    console.log(TAG + ownerId);
    if (userName === undefined || password === undefined) {
      let error = new Error('no username or password field provided!');
      error.name = 'Update AppUser Information Error';
      return cb(error);
    }

    Appuser.findById(ownerId, {}, function(error, user) {
      if (error) {
        return cb(error);
      }
      if (user !== null) {
        let upsertFilter = {where: {appUserId: ownerId}};
        let upsertObject = {
          userName: userName,
          password: password,
          name: name,
          companyName: companyName,
          secondPhone: secondPhone,
          appUserState: appUserState,
          appUserCity: appUserCity,
          profilePhoto: profilePhoto,
        };
        user.updateAttributes(upsertObject,
          function(error, updatedInformation) {
            if (error) {
              return cb(error);
            }
            returnResult();
          });
      }
    });
    function returnResult() {
      Appuser.findById(ownerId, {},
        function(error, updatedInfo) {
          console.log(TAG + 'AppUser Updated: ',
          JSON.stringify(updatedInfo));
          return cb(null, updatedInfo);
        });
    }
  };
};

