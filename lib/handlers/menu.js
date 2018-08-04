/*
*
* Route menuHandler for the menu
*/

// Dependencies
const _data = require("../data");
const helpers = require("../helpers");
const config = require("../../config");
const tokens = require("./tokens");



// Module object
var menuHandler ={};


// menu handler
menuHandler.menu = function(req, callback){
    if (req.method == 'get'){
      var email = typeof(req.queryStringObject.email) !== 'undefined' && helpers.validateEmail(req.queryStringObject.email) ? req.queryStringObject.email.trim() :false;
      var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;
      if(email && token){
        tokens.verifyToken(token,email,(tokenIsValid)=>{
          if(tokenIsValid){
            callback(200,config.menuItems);
          }else{
            callback(400,{'error':'invalid authentication token'})
          }
        });
      }else{
        callback(400,{'error':'missing required fields'})
      }
    }else{
        callback(405,{"Error":"Method not supported"});
    }
}

module.exports = menuHandler;
