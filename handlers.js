/*
*
* Route handlers for requests
*/

// Dependencies






// Module object
var handlers ={};

// Bad route handler
handlers.notFound = function(req,callback){
  callback(404,{"Error":"Not Found"});
};

// Users handlers
handlers.users = function(req, callback){
  var acceptableMethods = ['post','get','put','delete'];
    if (acceptableMethods.indexOf(req.method)> -1){
      handlers._users[req.method](req,callback);
    }else{
        callback(405);
    }
}

handlers._users = {};

// required data: name, email, street, password
// optional data: none
handlers._users.post = function(req,callback){
  var name = typeof(req.payload.name) !== 'undefined' && req.payload.trim().length > 0 ? req.payload.name : false;
  var email = typeof(req.payload.email) !== 'undefined' && helpers.validateEmail(req.payload.email) ? req.payload.email :false;
  var street = typeof(req.payload.street) !== 'undefined' && req.payload.trim().length > 5 ? req.payload.street : false;
  var password = typeof(req.payload.password) !== 'undefined' && req.payload.trim().length > 5 ? req.payload.password :false;

  if ( name && email && street && password){

  }else{
    callback();
  }
};

// required data: email
// optional data: none
handlers._users.get = function(req, callback){

};







// Export
module.exports = handlers;
