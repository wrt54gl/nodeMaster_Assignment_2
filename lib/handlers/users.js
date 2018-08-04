/*
*
* Route handlers for Users
*/

// Dependencies
const _data = require("../data");
const helpers = require("../helpers");
const config = require("../../config")
const tokens = require("./tokens");


// Module object
var userHandler ={};


// Users handlers
userHandler.users = function(req, callback){
  var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(req.method)> -1){
      userHandler._users[req.method](req,callback);
    }else{
        callback(405,{"Error":"Method not supported"});
    }
}

userHandler._users = {};

// required data: name, email, street, password
// optional data: none
userHandler._users.post = function(req,callback){
  var name = typeof(req.payload.name) !== 'undefined' && req.payload.name.trim().length > 0 ? req.payload.name.trim() : false;
  var email = typeof(req.payload.email) !== 'undefined' && helpers.validateEmail(req.payload.email) ? req.payload.email.trim() :false;
  var street = typeof(req.payload.street) !== 'undefined' && req.payload.street.trim().length > 5 ? req.payload.street.trim() : false;
  var password = typeof(req.payload.password) !== 'undefined' && req.payload.password.trim().length > 5 ? req.payload.password.trim() :false;


  if ( name && email && street && password){
    var hashedPassword = helpers.hashPassword(password);
    if (hashedPassword){
      var user = {
        name,
        email,
        street,
        hashedPassword
      };
      var fileName = helpers.emailToFilename(email);
      _data.create('users',fileName,user,function(err){
        if (!err){
          callback(200);
        }else{
          callback(400,{"Error":"User already exists"})
        }
      })
    }else{
      callback(500,{"Error":"Could not hash the password"});
    }
  }else{
    callback(400,{"Error":"Missing required fields"});
  }
};

// required data: email, token(in header)
// optional data: none
userHandler._users.get = function(req, callback){
  var email = typeof(req.queryStringObject.email) !== 'undefined' && helpers.validateEmail(req.queryStringObject.email) ? req.queryStringObject.email.trim() :false;
  var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;
  if(email && token){
    tokens.verifyToken(token,email,(tokenIsValid)=>{
      if(tokenIsValid){
        var fileName = helpers.emailToFilename(email);
        _data.read('users',fileName,(err,userData)=>{
          if(!err){
            callback(200,userData);
          }else{
            callback(400,{'error':'user not found'});
          }
        });
      }else{
        callback(400,{'error':'the authentication token is expired'});
      }
    });
  }else{
    callback(400,{'error':'missing required fields'});
  }
};

// Users - put
// Required data : email, token(in header)
// Optional data : name, email, street, password. At least one must be specified
userHandler._users.put = function(req, callback){
  var name = typeof(req.payload.name) !== 'undefined' && req.payload.name.trim().length > 0 ? req.payload.name.trim() : false;
  var email = typeof(req.payload.email) !== 'undefined' && helpers.validateEmail(req.payload.email) ? req.payload.email.trim() :false;
  var street = typeof(req.payload.street) !== 'undefined' && req.payload.street.trim().length > 5 ? req.payload.street.trim() : false;
  var hashedPassword = typeof(req.payload.password) !== 'undefined' && req.payload.password.trim().length > 5 ? helpers.hashPassword(req.payload.password.trim()) :false;
  var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;

  //Check for the required fields
  if(email && token && (name || street || hashedPassword)){
    tokens.verifyToken(token,email,(tokenIsValid)=>{
      if(tokenIsValid){
        var fileName = helpers.emailToFilename(email);
        _data.read('users',fileName,(err,userData)=>{
          if(!err && userData){
            //update the changed fields in the userData object
            userData.name = name ? name : userData.name;
            userData.street = street ? street : userData.street;
            userData.hashedPassword = hashedPassword ? hashedPassword : userData.hashedPassword;
            //write the data to the file
            _data.update('users',fileName,userData,(err)=>{
              if(!err){
                callback(200);
              }else{
                callback(500,{'error':'Could not update user.'});
              }
            });
          }else{
            callback(400,{'error':'That user does not exist.'})
          }
        });
      }else{
        callback(403,{'error':'invalid token'});
      }
    });
  }else{
    callback(400,{'error':'Missing required fields. See api documentation.'})
  }
};

// Users - delete
// Required data : email, token(in header)
// Optional data : name, email, street, password. At least one must be specified
userHandler._users.delete = function(req, callback){
  var email = typeof(req.queryStringObject.email) !== 'undefined' && helpers.validateEmail(req.queryStringObject.email) ? req.queryStringObject.email.trim() :false;
  var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;

  //Check for the required fields
  if(email && token){
    var fileName = helpers.emailToFilename(email);
    tokens.verifyToken(token,email,(tokenIsValid)=>{
      if(tokenIsValid){
        _data.read('users',fileName,(err,userData)=>{
          if(!err && userData){
            _data.delete('users',fileName,(err)=>{
              if(!err){
                callback(200);
              }else{
                callback(500,{'error':'user could not be deleted'});
              }
            });
          }else{
            callback(400,{'error':'that user does not exist'});
          }
        });
      }else{
        callback(403,{'error':'authentication token is invalid'});
      }
    });
  }else{
    callback(400,{'Error':'Missing required fields'});
  }
};


module.exports = userHandler;
