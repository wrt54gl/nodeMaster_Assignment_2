/*
* This handles calls to the mailgun api
*/

// Dependencies
const config = require('../config');
const querystring = require('querystring');
const https = require('https');
const mailgun = require('mailgun-js')({apiKey: config.mailGun.key, domain: config.mailGun.domain});

var lib = {};

lib.sendMail = function(email,subject,message,callback){
  console.log(email,subject,message);
  // Configure the request payload
  var data = {
    'from':config.mailGun.from,
    'to' : email,
    'subject' : subject,
    'text' : message
  };


  mailgun.messages().send(data,(error,body)=>{
    if(!error){
      console.log(error,body);
      callback(false);
    }else {
      console.log(error,body);
      callback(true);
    }
  });
};

module.exports = lib;
