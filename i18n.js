const i18n = require('i18n');

i18n.configure({
  // setup some locales - other locales default to en silently
  locales:['en', 'it'],

  // where to store json files - defaults to './lang' relative to modules directory
  directory: __dirname + '/locales',
  
  defaultLocale: 'it',
  
  // sets a custom cookie name to parse locale settings from  - defaults to NULL
  cookie: 'lang',
});

// https://www.drzon.net/posts/i18n-for-node-express/
module.exports = function(req, res, next) {
  i18n.init(req, res);
  // res.locales('__', res.__);
  // var current_locale = i18n.getLocale();
  return next();
};