


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
    'description':'House Special -- whats left from yesterday. Supprisingly good',
    'price': 9.78
  },
}


module.exports=config;
