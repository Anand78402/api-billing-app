'use strict';
const Config = require('../config/config');
const mongoose = require('mongoose');
// const User = mongoose.model('User');
const Jwt = require('jsonwebtoken');

exports.getUser = (req) => {
    var t = req.headers['authorization'];
    var token = t ? t.split(' ')[1] : '';
    if( token ) {
        try {
            var decoded = Jwt.verify(token, Config.key.privateKey);
            return decoded.id;
        } catch(err) {
            return '';
        }
    } else {
        return '';
    }
};