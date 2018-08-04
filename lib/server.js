
//Dependencies
const http = require('http');
const url = require('url');
const helpers = require('./helpers');
const config = require('../config');
const StringDecoder = require('string_decoder').StringDecoder;

const userHandler = require('./handlers/users');
const cartHandler = require('./handlers/cart');
const tokenHandler = require('./handlers/tokens');
const menuHandler = require('./handlers/menu');
const notFoundHandler = require('./handlers/notFound');
const orderHandler = require('./handlers/orders');

var server = {};


//Routes
server.router = {
  'users':userHandler.users,
  'tokens':tokenHandler.tokens,
  'cart':cartHandler.cart,
  'menu':menuHandler.menu,
  'order':orderHandler.order
};

//Instantiate a server
server.httpServer = http.createServer(function(req,res){

  //parse the url
  var parsedUrl = url.parse(req.url,true);

  //get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data',function(data){
    buffer += decoder.write(data);
  });
  req.on('end',function(){
    buffer += decoder.end();

    //Choose the handler
    var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : notFoundHandler.notFound;

    //construct the data object to send to the handlers
    var reqData = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload':helpers.parseJsonToObject(buffer)
    };


    chosenHandler(reqData,function(statusCode,payload){
      //Status Code: default to 200 if there is none
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      //check for a payload
      payload = typeof(payload) == 'object' ? payload :{};
      var payloadString=JSON.stringify(payload);

      //return the response
      res.setHeader('Content-Type','application/json');
      res.writeHead(statusCode);
      res.end(payloadString);

      console.log(`${method.toUpperCase()} /${trimmedPath}  ${statusCode}` );

    });

  });

});

//Initialize the server
server.init= function(){
  server.httpServer.listen(config.httpPort,function(){
    console.log(`The server is listening at http://localhost:${config.httpPort}`);
  });
};


module.exports = server;
