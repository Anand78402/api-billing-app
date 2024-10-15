const mongoose = require('mongoose');
const User = mongoose.model('User');
const CommonHelper = require('./common');
const Config = require('../config/config');

module.exports = {
    loginAdminOTP: async () => {
        var _sym = 'A!@#$%^&BCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        var str = '';
        var count = 5;
        for(var i = 0; i < count; i++) {
            str += _sym[parseInt(Math.random() * (_sym.length))];
        }
        while(true) {
            var user = await User.findOne({ loginCode: str });
            if(!user) {
                break;
            }
        }
        return str;
    },
    generateForgotPasswordOTP: async () => {
        var _sym = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        var str = '';
        var count = 5;
        for(var i = 0; i < count; i++) {
            str += _sym[parseInt(Math.random() * (_sym.length))];
        }
        while(true) {
            var user = await User.findOne({ forgotPasswordCode: str });
            if(!user) {
                break;
            }
        }
        return str;
    },
    emailExist: async (email) => {
        try {
            email = email.toLowerCase();
            return User.findOne({ email: email }).then((user) => 
                user ? user : false
            ).catch(e => true);
        } catch (err) {
            //Need to log
            console.error(err)
            return true;
        }
    },
    checkUser: async (id, email) => {
        try {
            return User.findOne({ $or: [{ fbId: id }, { email }, { appleId: id }] })
                .then((user) =>
                    user ? user : false
                )
                .catch(e => e)
        } catch (err) {
            console.error(err)
        }
    },
    createUser: async (body) => {
        try {
            let user = new User(body);
            user.password = CommonHelper.hashPassword(body.password);
            user.fullName = `${body.firstName} ${body.lastName}`;
            user.socialType = 1;
            user.userType = 2;
            user.acceptedPNPTNC = true;
            user.isEmailVerified = true;
            user = await user.save();
            return user;
        } catch (err) {
            return false;
        }
    },
    tokenExists: async (tokens, deviceType, deviceId) => {
        let status = {
            found: false,
            index: -1
        };
        try {
            for(let i = 0; i < tokens.length; i++){
                if(tokens[i].deviceType == deviceType){
                    if(tokens[i].deviceId == deviceId){
                        status.found = true;
                        status.index = i;
                        break;
                    }
                }
            }
            return status;
        } catch (err) {
            console.error(err)
        }
    },
    checkTokenExist: async (tokens, deviceType, deviceId) => {
        let status = {
            found: false,
            index: -1
        };
        try {
            for(let i = 0; i < tokens.length; i++) {
                if(tokens[i].deviceType === deviceType) {
                    if(tokens[i].deviceId === deviceId) {
                        status.found = true;
                        status.index = i;
                        break;
                    }
                }
            }
            return status;
        } catch (err) {
            console.error(err)
        }
    },
    alreadyExist: async (userName, email) => {
        try {
          userName = CommonHelper.removeEmptySpace(CommonHelper.toLowerCase(userName));
          email = CommonHelper.removeEmptySpace(CommonHelper.toLowerCase(email));
          return User.findOne({ $or: [ { userName },{ email } ], digitalDelete: false }).then((user) => (user ? user : false)).catch((e) => e);
        } catch (err) {
          console.error(err);
        }
    },
    checkManagerCreateStatus: async (builderId) => {
        const data = await Q.all([User.findById(builderId), User.find({ owner: builderId, digitalDelete: false, isManagerBanned: false })]);
        if (data[0] && data[0].manager > 0) {
          const builderManager = data[0] && data[0].manager ? data[0].manager : 0;
          const managerCount = data[1] ? data[1].length : 0;
          return managerCount >= builderManager ? true : false;
        } else {
          const builderSubscriptionData = await adminSubscriptionHelper.checkPremiumProjectSubscription(builderId);
          const builderManager = builderSubscriptionData ? (isExpiredSubscription(builderSubscriptionData.endDate) ? 0 : await getManagerCount()) : 0;
          const managerCount = data[1] ? data[1].length : 0;
          return managerCount >= builderManager ? true : false;
        }
    },
}