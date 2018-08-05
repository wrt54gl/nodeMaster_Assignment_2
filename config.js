


var config = {};

config.httpPort=3000;
config.hashingSecret = 'topsecret';

// This is the time that a token is valid in minutes
config.tokenTime = 300;

config.menuItems = {
  'Hawaiian':{
    'description':'Hawaiian with fresh ingredients',
    'price': 12.95
  },
  'Peperonni':{
    'description':'Premuim Peperonni with our special sauce and lots of cheese',
    'price': 11.78
  },
  'Meat Lovers':{
    'description':'The name says it all',
    'price': 13.42
  },
  'Greek':{
    'description':'Loaded with feta and olives',
    'price': 10.78
  },
  'Barbeque Chicken':{
    'description':'Barbeque Chicken grown without antibiotics. So fresh it sometimes twitches',
    'price': 11.67
  },
  'House':{
    'description':'House Special -- whats left from yesterday. Surprisingly good',
    'price': 9.78
  },
}

//Strip config
config.stripeAuth = 'sk_test_BQokikJOvBiI2HlWgH4olfQ2';
config.currency = 'cad';

//Mailgun config
config.mailGun = {
  'key':'50c4b3652e723d871cde0779e4d35194-a5d1a068-6d24a31b',
  'from':'Road Kill Pizza <road@kill.pizza.com>',
  'domain':'sandbox3cc2362cdd364bd9a22821b6f6e04b5a.mailgun.org'
};

//default sales tax rate in percent
config.taxRate = 5;

//comany name for emails
config.companyName = "Road Kill Pizza";

module.exports=config;
