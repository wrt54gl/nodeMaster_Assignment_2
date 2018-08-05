/*
* this is the handler for orders
*/

// Dependencies
const _token = require("./tokens");
const helpers = require("../helpers");
const _data = require("../data");
const payment = require("../stripe");
const mailer = require("../mailgun");
const config = require('../../config');


var orderHandler = {};

// Order handler allows : post get
orderHandler.order = function(req,callback){
  var acceptableMethods = ['post','get'];
    if (acceptableMethods.indexOf(req.method)> -1){
      orderHandler._order[req.method](req,callback);
    }else{
        callback(405,{"Error":"Method not supported"});
    }
};

orderHandler._order = {};

// order -- post
// required data : email, paymentToken, token(in header)
// optional data : none
orderHandler._order.post = function(req, callback){
  var email = typeof(req.payload.email) !== 'undefined' && helpers.validateEmail(req.payload.email) ? req.payload.email.trim() :false;
  var token = typeof(req.headers.token) == 'string' && req.headers.token.trim().length == 20 ? req.headers.token.trim() : false;
  var paymentToken = typeof(req.payload.paymentToken) == 'string' ? req.payload.paymentToken :false;
  if(email && token && paymentToken){
    _token.verifyToken(token,email,(tokenIsValid)=>{
      if(tokenIsValid){
        var fileName = helpers.emailToFilename(email);
        _data.read('users',fileName,(err,userData)=>{
          if(!err && userData){
            cart = typeof(userData.cart)=='object' && Object.keys(userData.cart).length > 0 ? userData.cart : false;
            //total up the cart
            if(cart){
              var order = {};
              var orderSubTotal = 0;
              var taxTotal = 0;
              var menu = config.menuItems;
              for (var item in cart){
                //calculate the order line
                var price =  menu[item].price;
                var qty = cart[item].quantity;
                var lineTotal = Math.round(qty * price * 100)/100;
                var lineTax = Math.round(lineTotal * (config.taxRate/100)*100)/100
                order[item] = menu[item]; // this will give us all the fields in the menu object
                order[item].quantity = qty;
                order[item].total = lineTotal;
                orderSubTotal += order[item].total;
                taxTotal += lineTax;
              }
              if(orderSubTotal>0){
                order.subTotal = orderSubTotal;
                order.taxTotal = Math.round(taxTotal*100)/100;
                order.total = orderSubTotal+taxTotal;
                //try to get payment for the order
                payment.sendPayment(paymentToken,order.total,userData.email,(err)=>{
                  if(!err){
                    // create order and empty out the cart
                    var orderNo = helpers.createRandomString(20);
                    _data.create('orders',orderNo,order,(err)=>{
                      if(!err){
                        if(typeof(userData.orders)!='object')
                          userData.orders=[];
                        userData.orders.push(orderNo);
                        userData.cart={};
                        _data.update('users',fileName,userData,(err)=>{
                          if(!err){
                            //email receipt
                            var emailMsg = '';
                            for (var item in order){
                              if(item != 'total' && item != 'subTotal' && item != 'taxTotal'){
                                let lItem = order[item];
                                emailMsg += `${lItem.quantity} -- ${item} ${lItem.description} ${lItem.total}\n`;
                              }
                            }
                            emailMsg += `\n    Sub Total: ${order.subTotal}\n`;
                            emailMsg += `    Tax Total: ${order.taxTotal}\n`;
                            emailMsg += `        Total: ${order.total}\n`;

                            mailer.sendMail(userData.email,config.companyName+" order",emailMsg,(err)=>{
                              if(!err){
                                callback(200);
                              }else{
                                callback(400,{'error':'order succeded but email to user failed'});
                              }
                            });
                          }else {
                            callback(500,{'error':'user could not be updated'});
                          }
                        });
                      }else{
                        callback(500,{'error':'order could not be created'})
                      }
                    });
                  }else{
                    callback(400,{'error':'payment failed'});
                  }
                });
              }else{
                callback(400,{'error':'zero value in cart. No order created'});
              }
            }else {
              callback(400,{'error':'can\'t make an order. The cart is empty'})
            }
          }else{
            callback(400,{'error':'user not found'});
          }
        });
      }else{
        callback(403,{'error':'invalid authentication token'});
      }
    });
  }else{
    callback(400,{'error':'missing required fields or authentication token'});
  }
};

// order -- get
// required data : id, email, token(in header)
// optional data : none
orderHandler._order.get = function(req, callback){
  callback(400,{'error':'not implemented'});
};




module.exports=orderHandler;
