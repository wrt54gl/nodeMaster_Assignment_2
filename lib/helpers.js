/*
*
* General purpose helper functions
*/

// Dependencies
const crypto = require('crypto');
const config = require('../config');

// Container for helpers
var helpers =  {};

// this parsed a string to a json object and provides error handling
helpers.parseJsonToObject = function(jsonString){
  try{
    var objOut = JSON.parse(jsonString);
    return objOut;
  }catch(e){
    return false;
  }
}

helpers.validateEmail=function(email){
    // from https://www.hacksparrow.com/javascript-email-validation.html
    // First check if any value was actually set
    if (email.length == 0) return false;
    // Now validate the email format using Regex
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return re.test(email);
};

helpers.emailToFilename=function(email){
  return email.replace("@","at");
};

helpers.hashPassword = function(password){
  if(typeof(password)=='string' && password.length > 0){
    var hash = crypto.createHmac('sha256',config.hashingSecret).update(password).digest('hex');
    return hash;
  }else{
    return false;
  }
};

//Create a string of random alphanumeric characters of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength :false;
  if (strLength){
    // Define all the possible characters that could go into string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    //start the final string
    var str = '';
    for (i=1;i<=strLength;i++){
      //Get random character from string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));
      //Append this character to str
      str += randomCharacter;
    }
    return str;
  }else{
    return false;
  }
};


module.exports = helpers;
