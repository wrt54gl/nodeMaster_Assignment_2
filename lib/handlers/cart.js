/*
*
* Route handlers for requests
*/

// Dependencies
const _data = require("../data");
const helpers = require("../helpers");
const config = require("../../config");
const tokens = require("./tokens");


// Module object
var cartHandler ={};

// shopping cart handler
cartHandler.cart = function(req,callback){
  var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(req.method)> -1){
      cartHandler._cart[req.method](req,callback);
    }else{
        callback(405,{"Error":"Method not supported"});
    }
};

cartHandler._cart = {};

// cart - post  --changes existing or adds items to the shopping cart
// Required data : email, token(in header)
// Optional data : array of menuItems with quantities
cartHandler._cart.post = function(req, callback){
  var email = typeof(req.payload.email) !== 'undefined' && helpers.validateEmail(req.payload.email) ? req.payload.email.trim() :false;
  var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;
  var items = typeof(req.payload.items) == 'object' && Object.keys(req.payload.items).length > 0 ? req.payload.items : false;
  if(email && token && items){
    tokens.verifyToken(token,email,(tokenIsValid)=>{
      if(tokenIsValid){
        var fileName = helpers.emailToFilename(email);
        _data.read('users',fileName,(err,userData)=>{
          if(typeof(userData.cart)!='object')
            userData.cart = {};
          var allItemsValid = true;
          var existingItems = typeof(userData.cart)=='object' ? userData.cart : {};
          if(!err && userData){
            // We need to make sure none of these items exist and they are all menus items with quantities
            for (var index in items){
              let item = items[index];
              if (typeof(existingItems[index])!='undefined'){
                //item already exists so update it.
                userData.cart[index]=item;
              }else if(typeof(config.menuItems[index])=='undefined' || typeof(item.quantity)!='number'){
                allItemsValid = false;
                break;
              }else{ //item does not exist in menuItems and there is a quantity
                userData.cart[index]=item;
              }
            }
            if(allItemsValid){
              _data.update('users',fileName,userData,(err)=>{
                if(!err){
                  callback(200,userData);
                }else{
                  callback(500,{'error':'could not update cart'});
                }
              });
            }else{
              callback(400,{'error':'Invalid item. No changes made.'});
            }
          }else{
            callback(400,{'error':'user not found'});
          }
        });
      }else{
        callback(403,{'error':'invalid authentication token'});
      }
    });
  }else{
    callback(400,{'error':'missing required fields or authentication token'});
  }
};

// cart - get  --returns a list of items in the shopping cart
// Required data : email, token(in header)
// Optional data : none
cartHandler._cart.get = function(req,callback){
  var email = typeof(req.queryStringObject.email) !== 'undefined' && helpers.validateEmail(req.queryStringObject.email) ? req.queryStringObject.email.trim() :false;
  var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;
  if(email && token){
    tokens.verifyToken(token,email,(tokenIsValid)=>{
      if(tokenIsValid){
        var fileName = helpers.emailToFilename(email);
        _data.read('users',fileName,(err,userData)=>{
          if(typeof(userData.cart)!='object')
            userData.cart = {};
          if(!err && userData){
            callback(200,userData.cart);
          }else{
            callback(400,{'error':'user not found'});
          }
        });
      }else{
        callback(403,{'error':'invalid authentication token'});
      }
    });
  }else{
    callback(400,{'error':'missing required fields or authentication token'});
  }
};

// cart - put  --adds new or changes existing cart items
// Required data : email, token(in header)
// Optional data : array of menuItems
cartHandler._cart.put = function(req,callback){
  //same as post
  cartHandler._cart.post(req,callback);
};

// cart - delete   --removes cart items
// Required data : email, token(in header)
// Optional data : deleteAll (true/false) if true delete whole cart, items (list of items to delete)
cartHandler._cart.delete = function(req,callback){
  var email = typeof(req.queryStringObject.email) !== 'undefined' && helpers.validateEmail(req.queryStringObject.email) ? req.queryStringObject.email.trim() :false;
  var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;
  var deleteAll = typeof(req.queryStringObject.deleteAll) == 'string' && req.queryStringObject.deleteAll.toLowerCase() == 'true' ? true : false;
  var itemsToDelete = typeof(req.queryStringObject.items) == 'string' && req.queryStringObject.items.length > 0 ? req.queryStringObject.items.split(",") : false;
  console.log(req.queryStringObject);
  console.log(email,token,deleteAll,itemsToDelete);
  if(email && token && (deleteAll || itemsToDelete)){
    tokens.verifyToken(token,email,(tokenIsValid)=>{
      if(tokenIsValid){
        var fileName = helpers.emailToFilename(email);
        _data.read('users',fileName,(err,userData)=>{
          if(!err){
            var itemListError = false;
            // update the appropriate items
            if(deleteAll){
              userData.cart = {};
            }else {
              for (var i in itemsToDelete){
                if(typeof(userData.cart[itemsToDelete[i]])!='undefined'){
                  delete userData.cart[itemsToDelete[i]];
                }else{
                  itemListError = true;
                }
              }
            }
            if(!itemListError){
              _data.update('users',fileName,userData,(err)=>{
                if(!err){
                  callback(200);
                }else {
                  callback(500,{'error':'Could not delete cart item(s)'});
                }
              });
            }else {
              callback(400,{'error':'some of those items were not in the cart'});
            }
          }else {
            callback(400,{'error':'User not found.'});
          }
        });
      }else{
        callback(403,{'error':'invalid authentication token'});
      }
    });
  }else{
    callback(400,{'error':'missing required fields or authentication token'});
  }
};


// Export
module.exports = cartHandler;
