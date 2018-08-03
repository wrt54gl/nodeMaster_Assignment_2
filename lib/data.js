/*
*
* This is for the data storage
*/

// Dependencies
const fs = require('fs');
const helpers = require('./helpers');
const path = require('path');


var fileStorage = {};

fileStorage.baseDir = path.join(__dirname,"/../.data/");

fileStorage.create = function(dir, file, data,callback){
  fs.open(fileStorage.baseDir+dir+"/"+file+".json",'wx',(err,fileDescriptor)=>{
    if(!err && fileDescriptor){
      var stringData = JSON.stringify(data);
      fs.writeFile(fileDescriptor,stringData,'utf8',(err)=>{
        if(!err){
          fs.close(fileDescriptor, (err)=>{
            if(!err){
              callback(false)
            }else{
              callback("Error closing file");
            }
          });
        }else{
          callback("Error writing to file.");
        }
      });
    }else{
      callback("Could not create a new file, It may already exist");
    }
  });
};

fileStorage.read = function(dir, file, callback){
  fs.readFile(fileStorage.baseDir+dir+"/"+file+".json",'utf8',(err, data)=>{
    var dataObj = helpers.parseJsonToObject(data);
    if(!err && dataObj){
      callback(false,dataObj);
    }else{
      callback(true,"Could not read file");
    }
  });
};

//Update data inside a file
fileStorage.update = function(dir, file, data, callback){
  // open the file for writing
  fs.open(fileStorage.baseDir+dir+'/'+file+'.json','r+',(err, fileDescriptor)=>{
    if(!err && fileDescriptor){
      var stringData = JSON.stringify(data);
      //Truncate the file
      fs.truncate(fileDescriptor,(err)=>{
        if(!err){
          //Write to the file and close it
          fs.writeFile(fileDescriptor,stringData,(err)=>{
            if(!err){
              fs.close(fileDescriptor,(err)=>{
                if(!err){
                  callback(false);
                }else{
                  callback('Error closing existing file');
                }
              });
            }else{
              callback('Error writing to existing file');
            }
          });
        }else{
          callback('Error Truncating file');
        }
      });
    }else{
      callback('Could not open the file for updating');
    }
  });
};


fileStorage.delete = function(dir, file, callback){
  fs.unlink(fileStorage.baseDir+dir+"/"+file+".json",(err)=>{
    if(!err){
      callback(false);
    }else{
      callback("Could not delete file");
    }
  });
}







module.exports = fileStorage;
