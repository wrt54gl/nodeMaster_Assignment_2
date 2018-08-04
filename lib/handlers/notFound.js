/*
*
* Route handler for not found requests
*/

// Dependencies

// Module object
var notFound ={};

// Bad route handler
notFound.notFound = function(req,callback){
  callback(404,{"Error":"Not Found"});
};

module.exports = notFound;
