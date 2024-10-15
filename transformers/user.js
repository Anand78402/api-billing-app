'use strict';
const Config = require('../config/config');

module.exports = {
    getProfile: function (user) {
        return {
            _id: user._id,
            fullName: user.fullName ? user.fullName : '',
            firstName: user.firstName ? user.firstName : '',
            lastName: user.lastName ? user.lastName : '',
            email: user.email,
            userType: user.userType,
            picture: user.picture ? user.picture : '',
            lastLogin: user.lastLogin,
            isEmailVerified: user.isEmailVerified,
            firstlogin: user.firstLogin ? user.firstLogin : false,
            isActive: user.isActive,
            address: user.address ? user.address : '',
            state: user.state ? user.state : '',
            city: user.city ? user.city : '',
            country: user.country ? user.country : '',
            region: user.region ? user.region : '',
            province: user.province ? user.province : '',
            zipCode: user.zipCode ? user.zipCode : '',
            updated_at: user.updated_at,
            created_at: user.created_at
        };
    },
    getUsersList: function (users) {
        const userList = users.map((user) => {
            return {
                _id: user._id,
                fullName: user.fullName ? user.fullName : '',
                firstName: user.firstName ? user.firstName : '',
                lastName: user.lastName ? user.lastName : '',
                email: user.email,
                userType: user.userType,
                picture: user.picture ? user.picture : '',
                lastLogin: user.lastLogin,
                isEmailVerified: user.isEmailVerified,
                firstlogin: user.firstLogin ? user.firstLogin : false,
                isActive: user.isActive,
                address: user.address ? user.address : '',
                state: user.state ? user.state : '',
                city: user.city ? user.city : '',
                country: user.country ? user.country : '',
                region: user.region ? user.region : '',
                province: user.province ? user.province : '',
                zipCode: user.zipCode ? user.zipCode : '',
                updated_at: user.updated_at,
                created_at: user.created_at
            };
        });
        return userList;
    },
    adminUserProfile: function (user) {
        return {
            _id: user._id,
            email: user.email,
            fullName: user.fullName ? user.fullName : '',
            firstName: user.firstName ? user.firstName : '',
            lastName: user.lastName ? user.lastName : '',
            userType: user.userType ? user.userType : 2,
            picture: user.picture ? user.picture : '',
            isEmailVerified: !!user.isEmailVerified,
            isActive: user.isActive ? user.isActive : false,
            lastLogin: user.lastLogin ? user.lastLogin : '',
            isLoggedIn: user.isLoggedIn ? user.isLoggedIn : false,
            tokens: user.tokens ? user.tokens : [],
            address: user.address ? user.address : '',
            updated_at: user.updated_at,
            created_at: user.created_at
        };
    },
};
