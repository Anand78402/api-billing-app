/*******************************************************************************
 * Admin Routes
 ******************************************************************************/
'use strict';
const UserController = require('../controllers/UserController')
const auth = require('../helpers/auth').validate;
const validator = require('express-joi-validation').createValidator({});
const AdminSchema = require('../validations/admin-schema');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const UserSchema = require('../validations/user-schema');


module.exports = function (app) {
    app.post('/admin/api/login', validator.body(AdminSchema.login), function (req, res) {
        UserController.login(req, res);
    });
    app.get('/admin/api/profile', auth, function (req, res) {
        UserController.getProfile(req, res);
    });
    app.post('/admin/api/signup', validator.body(UserSchema.signup), function (req, res) {
        UserController.signup(req, res);
    });
    app.put('/admin/api/update/profile', upload.any(), validator.body(UserSchema.updateProfile), auth, function (req, res) {
        UserController.updateProfile(req, res);
    });
    app.put('/admin/api/password/change', auth, validator.body(UserSchema.changePasswordSchema), function (req, res) {
        UserController.changePassword(req, res);
    });
    app.put('/admin/api/forgot/password', validator.body(UserSchema.forgotPassword), function (req, res) {
        UserController.forgotPassword(req, res);
    });
    app.get('/admin/api/verify/account/email/:id/:email/:token', function (req, res) {
        UserController.verifyEmail(req, res);
    });
    app.put('/admin/api/verify/code', validator.body(UserSchema.vefiryforgotPasswordCode), function (req, res) {
        UserController.verifyForgotPasswordCode(req, res);
    });
    app.put('/admin/api/reset/password', validator.body(UserSchema.resetPassword), function (req, res) {
        UserController.resetPassword(req, res);
    });
    app.get('/admin/api/users', auth, function (req, res) {
        UserController.getUsersList(req, res);
    });
    app.get('/admin/api/user/:id', auth, function (req, res) {
        UserController.getUserDetail(req, res);
    });
    app.delete('/admin/api/user/:id', auth, function (req, res) {
        UserController.remove(req, res);
    });
    app.put('/admin/api/user/status/:id', auth, function (req, res) {
        UserController.updateBanUnbanuser(req, res);
    });
    app.put('/admin/api/user/:id', auth, function (req, res) {
        UserController.update(req, res);
    });
};
