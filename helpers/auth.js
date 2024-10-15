'use strict';
const Config = require('../config/config');
const Jwt = require('jsonwebtoken');
const passport = require('passport');

module.exports = {
    validate: (req, res, next) => {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                return res.status(500).send({
                success: false,
                message: 'Error during authentication',
                });
            }
            if (!user) {
                return res.status(401).send({
                    success: false,
                    message: 'Failed to authenticate token'
                });
            }
            if (user && user.isLoggedIn) {
                var reurl = req.originalUrl;
                if (reurl.startsWith('/admin/api/') && (user.userType === 3)) {
                    return res.status(401).send({ statusCode: 401, error: 'Bad Request', message: 'Permision denied to access this api.' });
                } else {
                    req.user = user;
                    next();
                }
            }
        })(req, res, next);
    },
    accessRule: function(req, res, next) {
        var token = req.cookies.session;
        if (token) {
            // verifies secret and checks exp
            Jwt.verify(token, Config.key.privateKey, function(err, decoded) {
                if (err) {
                    return res.status(401).send({
                        success: false,
                        message: 'Failed to authenticate token'
                    });
                } else {
                    if (decoded.access && decoded.access[req.headers.module]) {
                        var am = decoded.access[req.headers.module];
                        if (am.selected) {
                            if (req.method == 'GET' && am.permissions.R) {
                                // if everything is good, save to request for use in other routes
                                req.auth = {};
                                req.auth.credentials = decoded;
                                next();
                            } else if (req.method == 'POST' && am.permissions.W) {
                                // if everything is good, save to request for use in other routes
                                req.auth = {};
                                req.auth.credentials = decoded;
                                next();
                            } else if (req.method == 'PUT' && am.permissions.U) {
                                // if everything is good, save to request for use in other routes
                                req.auth = {};
                                req.auth.credentials = decoded;
                                next();
                            } else if (req.method == 'DELETE' && am.permissions.D) {
                                // if everything is good, save to request for use in other routes
                                req.auth = {};
                                req.auth.credentials = decoded;
                                next();
                            } else {
                                return res.status(401).send({
                                    success: false,
                                    message: 'Access Denied'
                                });
                            }
                        } else {
                            return res.status(401).send({
                                success: false,
                                message: 'Access Denied'
                            });
                        }
                    } else {
                        return res.status(401).send({
                            success: false,
                            message: 'Access Denied'
                        });
                    }
                }
            });
        } else {
            // if there is no token
            // return an error
            return res.status(403).send({
                success: false,
                message: 'No token provided'
            });
        }
    }
};
