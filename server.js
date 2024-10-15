const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const _ = require('underscore-node');
const cons = require('consolidate');
const multer = require('multer');
const Config = require('./config/config');
const root = fs.realpathSync('.');
const json2xls = require('json2xls');
const i18n = require('./i18n');
const passport = require('./lib/passport');
const app = express();

require('./models');
require('./lib/database');
process.env.TZ = Config.timeZone;
// const UserController = require('./controllers/UserController');
// UserController.createDefaultSuperAdmin();

//configuring vendor based middlewares
app.use('/dist', express.static(__dirname + '/dist/'));
app.use('/js', express.static(__dirname + '/dist/js/'));
app.use('/css', express.static(__dirname + '/dist/css/'));
app.use('/img', express.static(__dirname + '/dist/img/'));
app.use('/fonts', express.static(__dirname + '/dist/fonts/'));
app.use('/src', express.static(__dirname + '/src/'));
app.use('/lib', express.static(__dirname + '/lib/'));
app.use('/lib', express.static(__dirname + '/lib/'));
app.use('/uploads', express.static(__dirname + '/uploads/'));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(json2xls.middleware);
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,language');
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  next();
});

//rendering engine
app.set('views', './');
app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.use(i18n);
require('./routes')(app);

app.use(i18n);
app.get('/*', function (req, res) {
  res.sendFile(path.join(root, 'index.html'), { socketUrl: Config.baseUrl });
});

// Example error handler
app.use(function (err, req, res, next) {
  if (err.isBoom) {
    if(err.output && (err.output.statusCode == 400)) {
      return res.status(err.output.statusCode).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.data[0].message
      });
    } else {
      return res.status(err.output.statusCode).json(err.output.payload);
    }
  } else if(err) {
    var env = require('get-env')({
      staging: 'staging',
      test: 'test'
    });
    if(env == 'dev') {
      next(err);
    } else {
      return res.status(500).send({'error': err.toString()+' in any file'});
    }
  }
});

//SERVER LISTENING
var port = Config.server.port || 4001;
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port; //Route to Frontend to make socket connection
  console.log('Node server running at http://%s:%s. API in use: %s', host, port, app.get('env'));
});