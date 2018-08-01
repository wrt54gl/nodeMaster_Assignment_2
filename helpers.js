/*
*
* General purpose helper functions
*/

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

helpers.validateEmail(email){
    // from https://www.hacksparrow.com/javascript-email-validation.html
    // First check if any value was actually set
    if (email.length == 0) return false;
    // Now validate the email format using Regex
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return re.test(email);
};

helpers.changeEmailToFilename(email){
  return email.replace("@","at");
};


module.exports = helpers;
