'use strict';
// mongodb connection
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const dbConfig = require('../config/config');
mongoose.connect(dbConfig.mongodb.url);
console.log('Database connection done');
