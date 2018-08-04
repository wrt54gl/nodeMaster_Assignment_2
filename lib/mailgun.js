/*
* This handles calls to the mailgun api
*/

// Dependencies


var lib = {};

lib.sendMail = function(email,subject,message,callback){
  console.log(email,subject,message);

  callback(false);
};


module.exports = lib;
