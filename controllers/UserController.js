/*******************************************************************************
 * User Controller
 ******************************************************************************/
'use strict';
const mongoose = require('mongoose');
const User = mongoose.model('User');
const _ = require('underscore-node');
const Config = require('../config/config');
const Jwt = require('jsonwebtoken');
const UserHelper = require('../helpers/user');
const Q = require('q');
const schedule = require('node-schedule');
const MailHelper = require('../helpers/mail');
const CommonHelper = require('../helpers/common');
const moment = require('moment');
const UserTransformer = require('../transformers/user');

module.exports = {
    login: async function (req, res) {
        try {
            let email = req.body.email;
            console.log("hello");
            let password = req.body.password;
            email = email ? email.toLowerCase() : '';
            let user = await User.findOne({ email: email, userType: { $in: [1, 2] } });
            if (!user) {
                return res.status(401).send({ success: false, message: res.__('InvalidEmailOrPassword'), ermessage: 'loginError', data: null });
            }
            if (!user.isActive) {
                return res.status(401).send({ success: false, message: res.__('YourAccountDisabledContactToAdmin'), ermessage: 'loginError', data: null });
            }
            if (!user.isEmailVerified) {
                return res.status(403).send({ success: false, message: res.__('YourAccountNotVerifiedYet'), data: null });
            }
            let today = new Date();
            if (user.loginAttemp && user.loginAttemp >= 3) {
                let start = moment(today, 'YYYY-M-DD HH:mm:ss');
                let end = moment(user.loginAttempDate ? user.loginAttempDate : today, 'YYYY-M-DD HH:mm:ss');
                let minutes = start.diff(end, 'minutes');
                if (minutes > 30) {
                    user.loginAttemp = 0;
                    if (!CommonHelper.comparePassword(password, user.password)) {
                        user.loginAttempDate = today;
                        user.loginAttemp = parseInt(user.loginAttemp ? (user.loginAttemp + 1) : 1);
                        await user.save();
                        let msg = user.loginAttemp == 3 ? res.__('YourAccountSuspendedWait30Min') : 'Credenziali di login non valide, ' + (3 - user.loginAttemp) + ' tentativi rimanenti';
                        return res.status(401).send({ success: false, message: msg, ermessage: 'loginError', data: null });
                    } else {
                        let loginData = { id: user.id, email: user.email, fullName: user.fullName, userType: user.userType, loginWay: 'admin' };
                        let token = Jwt.sign(loginData, Config.key.privateKey, { expiresIn: '1h' });
                        user.lastLogin = today;
                        user.loginAttempDate = today;
                        user.loginAttemp = 0;
                        user.isActive = true;
                        user.isLoggedIn = true;
                        await user.save();
                        return res.status(200).send({ token: token, userId: user._id, userType: user.userType, message: 'Success' });
                    }
                } else {
                    user.loginAttempDate = today;
                    await user.save();
                    return res.status(401).send({ success: false, message: res.__('YourAccountSuspendedWait30Min'), ermessage: 'loginError', data: null });
                }
            } else if (!CommonHelper.comparePassword(password, user.password)) {
                user.loginAttempDate = today;
                user.loginAttemp = parseInt(user.loginAttemp ? (parseInt(user.loginAttemp) + 1) : 1);
                await user.save();
                let msg = user.loginAttemp && (user.loginAttemp == 3) ? res.__('YourAccountSuspendedWait30Min') : 'Credenziali di login non valide, ' + (3 - user.loginAttemp) + ' tentativi rimanenti';
                return res.status(401).send({ success: false, message: msg, ermessage: 'loginError', data: null });
            } else {
                let loginData = { _id: user.id, email: user.email, fullName: user.fullName, userType: user.userType, loginWay: 'admin' };
                let token = Jwt.sign(loginData, Config.key.privateKey, { expiresIn: '1h' });
                user.lastLogin = today;
                user.loginAttempDate = today;
                user.loginAttemp = 0;
                user.isActive = true;
                user.isLoggedIn = true;
                await user.save();
                return res.status(200).send({ token: token, userId: user._id, userType: user.userType, message: 'Success' });
            }
        } catch (err) {
            return res.status(500).send({ success: false, message: 'Error', data: err });
        }
    },
    createDefaultSuperAdmin: async function (req, res) {
        const nuser = {
            email: Config.deaultSuperAdmin.email,
            password: Config.deaultSuperAdmin.password,
            firstName: Config.deaultSuperAdmin.firstName,
            lastName: Config.deaultSuperAdmin.lastName,
            fullName: Config.deaultSuperAdmin.fullName,
            userType: Config.deaultSuperAdmin.userType,
            isEmailVerified: Config.deaultSuperAdmin.isEmailVerified
        };
        try {
            let usr = await User.findOne({ email: nuser.email });
            if (!usr) {
                let user = new User(nuser);
                user.password = CommonHelper.hashPassword(nuser.password);
                await user.save();
                console.log("Super Admin created successfully");
            } else {
                usr.fullName = nuser.fullName;
                await usr.save();
                console.log("Super Admin updated successfully");
            }
        } catch (err) {
            console.error('Error creating or updating Super Admin:', err);
        }
    },
    updateProfile: async function (req, res) {
        try {
            let picture;
            const user = await User.findOne({ _id: req.user._id }).exec();
            if (!user) {
                return res.status(404).send({ success: false, message: res.__('DataNotFound'), data: null });
            }
            if (req.files && req.files.length) {
                for (const file of req.files) {
                    if (file.fieldname === 'picture') {
                        picture = file;
                        break;
                    }
                }
            }
            if (picture) {
                const ifile = picture;
                const ifileType = CommonHelper.getFileExtension(ifile.originalname);
                const ifileName = CommonHelper.randomString() + '_' + Date.now();
                const icontentType = ifile.mimetype;
                const userFile = await CommonHelper.uploadDocsTOS3(ifile.path, `user/original_${ifileName}.${ifileType}`, icontentType);
                user.picture = userFile || '';
            }
            user.fullName = `${req.body.firstName} ${req.body.lastName}`;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.address = req.body.address ? req.body.address : '';
            user.zipCode = req.body.zipCode ? req.body.zipCode : '';
            user.state = req.body.state ? req.body.state : '';
            user.province = req.body.province ? req.body.province : '';
            user.region = req.body.zipCode ? req.body.region : '';
            user.city = req.body.city ? req.body.city : '';
            const updatedUser = await user.save();
            res.status(200).send({ success: true, message: res.__('YourProfileUpdatedSuccessfully'), data: UserTransformer.getProfile(updatedUser) });
        } catch (err) {
            res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: null });
        }
    },
    getProfile: function (req, res) {
        User.findById(req.user._id).then((user) => {
            if (user) {
                res.status(200).send({ success: true, message: res.__('Success'), data: UserTransformer.getProfile(user) })
            } else {
                res.status(404).send({ success: false, message: res.__('DataNotFound'), data: null });
            }
        }).catch((error) => {
            res.status(500).send({ success: false, message: res.__('DataNotFound'), data: error });
        });
    },
    signup: async function (req, res) {
        let { email, password, firstName, lastName, isCreatedByAdmin } = req.body;
        let emailExists, user, token, link, emailTemplate, emailOptions;
        email = email.trim();     
        try {
            emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).send({ success: false, message: res.__('EmailAlreadyExist'), data: null });
            password = CommonHelper.hashPassword(password);
            req.body.password = password;
            user = new User(req.body);
            if (firstName && lastName) {
                user.fullName = `${firstName} ${lastName}`;
            }
            if (isCreatedByAdmin) {
                user.isEmailVerified = true;
            } else {
                token = CommonHelper.generateToken(user);
                user.emailVerifyToken = token;
                link = `${Config.adminBaseUrl}/account/verify?id=${user._id}&email=${user.email}&token=${token}`;
                var to = {
                    name: user.firstName,
                    email: user.email,
                    link: link
                };
                emailTemplate = 'userAccountVerification';
                emailOptions = Object.assign({}, res.__('AccountVerification'));
                emailOptions.Subject =  emailOptions.Subject;
                emailOptions.Body = emailOptions.Body;
                MailHelper.sendEmailBySendgrid(to, emailOptions, emailTemplate);
            }
            user = await user.save();
            const successMessage = isCreatedByAdmin ? res.__('UserSuccessfullyAdded') : res.__('UserSignupSuccessfullyDone');
            res.status(200).send({ success: true, message: successMessage, data: { _id: user._id } });
        } catch (err) {
            return res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: err });
        }
    },    
    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword, confirmPassword } = req.body;
            if (oldPassword === newPassword) {
                return res.status(400).send({
                    success: false, message:
                        res.__('OldNNewConfirmPassworNotSame'), data: null
                });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).send({
                    success: false, message: res.__('NewNConfirmPassworNotSame'),
                    data: null
                });
            }
            const user = await User.findOne({ _id: req.user._id });
            if (!user) {
                return res.status(500).send({
                    success: false, message: res.__('SomethingWentWrong'),
                    data: null
                });

            }
            if (!CommonHelper.comparePassword(oldPassword, user.password)) {
                return res.status(400).send({
                    success: false, message: res.__('YourOldPasswordIncorrect'),
                    data: null
                });
            }
            user.password = CommonHelper.hashPassword(newPassword);
            user.isPasswordChanged = true;
            await user.save();
            return res.status(200).send({ success: true, message: res.__('YourPasswordUpdatedSuccessfully'), data: null });
        } catch (err) {
            return res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: err });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            let emailOptions, emailTemplate;
            req.body.email = req.body.email.trim();
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                const to = {
                    name: user.firstName,
                    email: user.email,
                };
                emailOptions = Object.assign({}, res.__('UserForgotPassword'));
                emailOptions.Subject =  emailOptions.Subject;
                emailTemplate = 'userForgotPassword';
                const otp = await UserHelper.generateForgotPasswordOTP();
                // Expire otp after 30 min
                const endTime = +new Date() + (30 * 60 * 1000);
                schedule.scheduleJob(endTime, async () => {
                    user.forgotPasswordCode = '';
                    await user.save();
                });
                to.code = otp;
                user.forgotPasswordCode = otp;
                await user.save();
                MailHelper.sendEmailBySendgrid(to, emailOptions, emailTemplate);
                return res.status(200).send({ success: true, message: res.__('ResetPasswordCodeSent'), data: null });
            } else {
                return res.status(404).send({ success: false, message: res.__('EmailNotRegisteredWithUs'), data: null });
            }
        } catch (err) {
            return res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: err });
        }
    },
    verifyForgotPasswordCode: async (req, res) => {
        try {
            const user = await User.findOne({ forgotPasswordCode: req.body.code });
            if (!user) {
                return res.status(404).send({ success: false, message: res.__('CodeExpiredRequestNewOne'), data: null });
            }
            user.forgotPasswordCode = '';
            user.forgotPasswordToken = await CommonHelper.generateToken(user);
            await user.save();
            res.status(200).send({ success: true, message: res.__('Success'), data: { userId: user._id, token: user.forgotPasswordToken } });
        } catch (err) {
            return res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: err });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { userId, token, newPassword, confirmPassword } = req.body;
            if (newPassword !== confirmPassword) {
                return res.status(400).send({
                    success: false, message: res.__('NewConfirmPasswordNotSame'),
                    data: null
                });
            }
            const user = await User.findOne({ _id: userId, forgotPasswordToken: token });
            if (!user) {
                return res.status(404).send({ success: false, message: res.__('DataNotFound'), data: null });

            }
            user.forgotPasswordToken = '';
            user.password = await CommonHelper.hashPassword(newPassword);
            await user.save();
            return res.status(200).send({ success: true, message: res.__('YourPasswordResetSuccess'), data: null });
        } catch (err) {
            return res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: err });
        }
    },
    getUsersList: (req, res) => {
        var query = {};
        var offset = req.query.page ? (req.query.page - 1) * req.query.limit : 0;
        var limit = req.query.limit ? req.query.limit : 10;
        if (!query.$and) {
            query.$and = [];
        }
        if (req.query.name) {
            var name = req.query.name;
            query.$and.push({ '$or': [{ fullName: { $regex: new RegExp(name.toLowerCase(), 'i') } }, { email: { $regex: new RegExp(name.toLowerCase(), 'i') } }] });
        }
        if (req.query.userType) {
            query.$and.push({ userType: req.query.userType });
        }
        if (req.query.isActive) {
            query.$and.push({ isActive: req.query.isActive });
        }
        if (!query.$and.length) {
            query = { userType: 2 };
        } else {
            query.$and.push({ userType: 2 });
        }
        Q.all([
            User.countDocuments(query).exec(),
            User.find(query).sort('-created_at').skip(parseInt(offset)).limit(parseInt(limit)).exec()
        ]).then(function (users) {
            return res.status(200).send({ success: true, message: 'success', data: UserTransformer.getUsersList(users[1]), totalCount: users[0] });
        }).catch(function (err) {
            return res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: err });
        });
    },
    verifyEmail: async function (req, res) {
        try {
            const user = await User.findOne({
                $and: [
                    { _id: req.params.id },
                    { email: req.params.email },
                    { emailVerifyToken: req.params.token }
                ]
            });
            if (!user) {
                return res.status(404).send({
                    success: false,
                    message: res.__('LinkExpiredOrInvalid'),
                    data: null
                });
            }
            user.emailVerifyToken = '';
            user.isEmailVerified = true;
            await user.save();
            return res.status(200).send({
                success: true,
                message: res.__('YourAccountVerifiedNotLogin'),
                data: null
            });
        } catch (err) {
            return res.status(500).send({
                success: false,
                message: res.__('SomethingWentWrong'),
                data: err
            });
        }
    },
    getUserDetail: async (req, res) => {
        let user;
        try {
            user = await User.findOne({ _id: req.params.id });
            if (!user) return res.status(404).send({ success: false, message: res.__('DataNotFound'), data: null });
            return res.status(200).send({ success: true, message: res.__('Success'), data: UserTransformer.getProfile(user) });
        } catch (err) {
            res.status(500).send({ success: false, message: res.__('DataNotFound'), data: err });
        }
    },
    updateBanUnbanuser: async function (req, res) {
        try {
            const user = await User.findOne({ _id: req.params.id });
            if (!user) {
                return res.status(404).send({ success: false, message: res.__('DataNotFound'), data: null });
            }
            user.isActive = req.body.isActive;
            if (req.body.isActive === false) {
                user.isLoggedIn = false;
                user.tokens = [];
            }
            await user.save();
            res.status(200).send({ success: true, message: res.__('ProfileUpdateSuccessfully'), data: user.isActive });
        } catch (err) {
            res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: null });
        }
    },
    update: async function (req, res) {
        try {
            const user = await User.findOne({ _id: req.params.id });
            if (!user) {
                return res.status(404).send({ success: false, message: res.__('DataNotFound'), data: null });
            }
            const { firstName, lastName } = req.body
            user.firstName = firstName
            user.lastName = lastName
            user.fullName = user.fullName = `${firstName} ${lastName}`;
            await user.save();
            res.status(200).send({ success: true, message: res.__('UserUpdatedSuccessfully'), data: { _id: user._id } });
        } catch (err) {
            res.status(500).send({ success: false, message: res.__('SomethingWentWrong'), data: null });
        }
    },
    remove: async (req, res) => {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).send({success: false, message: res.__('DataNotFound'), data: null});
            }
            return res.status(200).send({success: true, message: res.__("UserDeletedSuccessfully"), data: null});
        } catch (err) {
            return res.status(500).send({success: false, message: res.__("SomethingWentWrong"), data: err,});
        }
    },
};


