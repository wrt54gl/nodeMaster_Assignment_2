/*
* This handles the stripe api
*/


//Dependencies
const config = require('../config');
const querystring = require('querystring');
const https = require('https');
var lib = {};

lib.sendPayment = function(sourceToken,amount,email,callback){
  // Configure the request payload
  var payload = {
    'amount':amount*100,
    'currency' : config.currency,
    'source' : sourceToken,
    'description' : 'Pizza order for: '+email
  };

  //Stringify the payload
  var stringPayload = querystring.stringify(payload);

  // Configure the request details
  var requestDetails = {
    'protocol':'https:',
    'hostname':'api.stripe.com',
    'method':'post',
    'path':'/v1/charges',
    'auth':config.stripeAuth+':',
    'headers':{
      'Content-Type':'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(stringPayload)
    }
  };

  //Instantiate the request userObject
  var req = https.request(requestDetails,function(res){
    var rcvData;
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      rcvData += chunk;
    });
    res.on('end', () => {
      //Grab the status of the sent request
      var status = res.statusCode;
      //Callback successfully if the request went through
      if(status==200 || status == 201){
        callback(false);
      }else{
        console.log(rcvData);
        callback('Status code returned was: '+status);
      }
    });
  });

  //Bind to the error event so it doesn't get thrown
  req.on('error',function(e){
    callback(e);
  });

  //Add the payload
  req.write(stringPayload);

  //End the request
  req.end();

};

module.exports = lib;
