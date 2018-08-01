/*
*
* This is for the data storage
*/

// Dependencies
const fs = require('fs');
const helpers = require('./helpers');

var file = {};

file.baseDir = path.join(__dirname,'/../.data/');

file.create = function(dir, file, data,callback){
  fs.writeFile(file.baseDir+dir+"/"+file+".json",'utf8',(err)=>{
    if(!err){
      callback(false)
    }else{
      callback(true,{"Error":"Could not create file"});
    }
  });
};

file.read = function(dir, file, callback){
  fs.readFile(file.baseDir+dir+"/"+file+".json",'utf8',(err, data)=>{
    var dataObj = helpers.parseJsonToObject(data);
    if(!err && dataObj){
      callback(false,dataObj);
    }else{
      callback(true,{"Error":"Could not read file"});
    }
  });
};

file.update = function(dir, file, data,callback){

}


file.delete = function(dir, file, data,callback){

}







module.exports = file;
