/*
*
* Route handlers for requests
*/

// Dependencies
const _data = require("../data");
const helpers = require("../helpers");
const config = require("../../config")



// Module object
var tokenHandler ={};


// Verify Token is valid for a given user
tokenHandler.verifyToken = function(id,email,callback){
  _data.read('tokens',id,(err,tokenData)=>{
    if(!err && tokenData){
      if(tokenData.email == email && Date.now()<tokenData.expires){
        callback(true);
      }else{
        callback(false);
      }
    }else {
      callback(false);
    }
  });
};


// Tokens handlers
tokenHandler.tokens = function(req, callback){
  var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(req.method)> -1){
      tokenHandler._tokens[req.method](req,callback);
    }else{
        callback(405,{"Error":"Method not supported"});
    }
}

tokenHandler._tokens = {};

// Tokens - post
// Required data : email, password
// Optional data : none
tokenHandler._tokens.post = function(req, callback){
  var email = typeof(req.payload.email) !== 'undefined' && helpers.validateEmail(req.payload.email) ? req.payload.email.trim() :false;
  var password = typeof(req.payload.password) !== 'undefined' && req.payload.password.trim().length > 5 ? req.payload.password.trim() :false;
  if(email && password){
    var userFileName = helpers.emailToFilename(email);
    _data.read("users",userFileName,(err, userData)=>{
      if(!err){
        // Hash the password of the request and compair it to the users hashed password
        if(userData.hashedPassword == helpers.hashPassword(password)){
          //create the token
          var id = helpers.createRandomString(20);
          var tokenData = {
            email,
            id,
            'expires':Date.now()+1000*60*config.tokenTime
          }
          _data.create('tokens',id,tokenData,(err)=>{
            if(!err){
              callback(200,tokenData);
            }else{
              callback(500,{'Error':'Could not create new token'});
            }
          });
        }else{
          callback(400,{'Error':'Bad password'});
        }
      }else{
        callback(400,{'Error':'User not found'});
      }
    });
  }else{
    callback(400,{"Error":"Missing required fields"});
  }
};


// Tokens - get
// Required data : id
// Optional data : none
tokenHandler._tokens.get = function(req, callback){
  var id = typeof(req.queryStringObject.id) == 'string' && req.queryStringObject.id.trim().length== 20 ? req.queryStringObject.id.trim():false;
  if (id){
    _data.read('tokens',id,(err,tokenData)=>{
      if(!err && tokenData){
        callback(200,tokenData);
      }else{
        callback(400,{'Error':'Token not found'});
      }
    });
  }else{
    callback(400,{'Error':'Missing required fields or invalid token id'});
  }
};


// Tokens - put
// Required data : id, extend
// Optional data : none
tokenHandler._tokens.put = function(req, callback){
  var id = typeof(req.payload.id) == 'string' && req.payload.id.trim().length== 20 ? req.payload.id.trim():false;
  var extend = typeof(req.payload.extend)=='boolean' && req.payload.extend ? true : false;

  if(id && extend){
    _data.read('tokens',id,(err,tokenData)=>{
      if(!err && tokenData){
        // Check to make sure the token is not expired
        if(tokenData.expires > Date.now()){
          //Set the expiration in the future
          tokenData.expires = Date.now()+1000*60*config.tokenTime;
          // and update it
          _data.update('tokens',id,tokenData,(err)=>{
            if(!err){
              callback(200);
            }else{
              callback(500,{'Error':'Could not update token'});
            }
          });
        }else{
          callback(400,{'Error':'Token is already expired'});
        }
      }else{
        callback(400,{'Error':'Token not found'});
      }
    });
  }else{
    callback(400,{'Error':'Missing or invalid fields.'})
  }
};


// Tokens - delete
// Required data : id
// Optional data : none
tokenHandler._tokens.delete = function(req, callback){
  var id = typeof(req.queryStringObject.id) == 'string' && req.queryStringObject.id.trim().length== 20 ? req.queryStringObject.id.trim():false;
  if(id){
    _data.read('tokens',id,(err,tokenData)=>{
      if(!err && tokenData){
        _data.delete('tokens',id,(err)=>{
          if(!err){
            callback(200);
          }else{
            callback(500,{'error':'Could not delete token'});
          }
        });
      }else{
        callback(400,{'error':'Token does not exist'});
      }
    });
  }else{
    callback(400,{'Error':'Missing required field'});
  }
};


module.exports = tokenHandler;
