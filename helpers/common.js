/** *****************************************************************************
 * Common Helper
 ******************************************************************************/
'use strict';
const mongoose = require('mongoose');
const sharp = require('sharp');
const Config = require('../config/config');
const knox = require('knox');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const moment = require('moment');
const Jwt = require('jsonwebtoken');
const saltRounds = 10;
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // crypto.randomBytes(32);
const iv = crypto.randomBytes(16); // Config.key.IV; //crypto.randomBytes(16);

function convertTo12Hours(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
        time = time.slice(1); // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
}

exports.encryptString = (text) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
};

exports.decryptString = (hash) => {
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(hash.iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
    return decrypted.toString();
};

exports.clearUploadFolder = () => {
    const directory = 'uploads';
    fs.readdir(directory, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
                console.log('Deleted ');
            });
        }
    });
};

exports.compareTime = (ctime, ptime) => {
    var cctime = ctime.split(':');
    var pptime = ptime.split(':');
    var cftime = (parseInt(cctime[0]) * 60) + parseInt(cctime[1]);
    var pftime = (parseInt(pptime[0]) * 60) + parseInt(pptime[1]);
    if (cftime < pftime) {
        return true;
    } else {
        return false;
    }
};

exports.checkMinutesMoreThan = (pastDateTime, minutes) => {
    var today = moment(new Date());
    var pastDate = moment(pastDateTime);
    var lastminutes = today.diff(pastDate, 'minutes');
    if (lastminutes > minutes) {
        return true;
    } else {
        false;
    }
};

exports.checkTodayExpired = (expiryDate) => {
    var expDate = moment(expiryDate);
    var today = moment(new Date());
    if (today > expDate) {
        return true;
    } else {
        return false;
    }
};

exports.getYearLastDate = () => {
    var year = new Date().getFullYear();
    return year + '-12-31T23:59:59.000Z';
};

exports.checkTodaylessThanDate = async(expiryDate) => {
    try {
        var expDate = moment(expiryDate);
        var today = moment();
        expDate.endOf('day').fromNow();
        var date1 = moment(expDate, 'MM/DD/YYYY');
        var date2 = moment(today, 'MM/DD/YYYY');
        var duration = moment.duration(date2.diff(date1));
        var t = Math.ceil(duration.asSeconds());
        if (t <= -1) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
};

exports.checkTodaylessThanEqualDate = async(expiryDate) => {
    try {
        var expDate = moment(expiryDate);
        var today = moment(new Date());
        if (today <= expDate) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
};

exports.getRandomSystemPassword = (length) => {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var passwordLength = length;
    var password = '';
    for (var i = 0; i <= passwordLength; i++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
};

exports.hashPassword = (password) => {
    return bcrypt.hashSync(password, saltRounds);
};

exports.comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword);
};
exports.getFileExtension = (filename) => {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
};

exports.decrypt = (password) => {
    return decrypt(password);
};

exports.encrypt = (password) => {
    return encrypt(password);
};

// generate token
exports.generateToken = (user) => {
    var jwtdata = {
        id: user._id,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        userType: user.userType,
        socialType: user.socialType,
        socialId: user.socialId,
        soulCampMembership: user.soulCampMembership,
        isFunnelInCompleted: user.isFunnelInCompleted,
        loginWay: 'user'
    };
    return Jwt.sign(jwtdata, Config.key.privateKey, {
        expiresIn: Config.key.tokenExpiry
    });
};

exports.createTxnId = function() {
    return Date.now();
};

exports.createFileName = function(text) {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-') + '_' + Date.now();
};

exports.randomString = function() {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
};

exports.getTodayDeliveryDate = function() {
    var now = new Date();
    var d = now.getDate();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();
    var date = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY').add(0, 'days').format('DD/MM/YYYY');
    return date;
};

exports.getDeliveryDate = function() {
    var now = new Date();
    var d = now.getDate();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();
    var h = now.getHours();
    var timeMinutes = (h * 60) + now.getMinutes();
    var day = now.getDay();
    var date = '';
    var tm = 960;
    if (day == 0) { // Sunday
        date = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY').add(2, 'days').format('DD/MM/YYYY');
    } else {
        if (timeMinutes < tm) {
            date = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY').add(1, 'days').format('DD/MM/YYYY');
        } else {
            date = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY').add(2, 'days').format('DD/MM/YYYY');
        }
    }
    return date;
};

exports.groupBy = async function(objectArray, property) {
    return objectArray.reduce(function(acc, obj) {
        var key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
};

exports.sortByKey = async function(array, key) {
    return array.sort((a, b) => {
        return new Date(b[key]).getTime() - new Date(a[key]).getTime();
    });
};

exports.areArraysEqual = function(array1, array2) {
    if (array1.length !== array2.length) return false;
    var isSame = true;
    if (array1.length === array2.length) {
        for (var i = 0; i < array1.length; i++) {
            if (array2.indexOf(array1[i]) === -1) {
                isSame = false;
            }
        }
        return isSame;
    } else {
        return false;
    }
};

/**
 *
 * @param {*} userId
 * @param {*} videoId This videoId Can Video Id or Webinar Id or Meditazione Id or Sfide Id
 * @param {*} courseId
 * @param {*} videoType
 * @returns
 */
exports.createVideoWatchingId = async function(userId, courseId, chapterId, lessonId, videoId) {
    return userId + '_' + courseId + '_' + chapterId + '_' + lessonId + '_' + videoId;
};

exports.getCurrentDateTime = function() {
    var now = new Date();
    // var d = now.getDate();
    // var m = now.getMonth() + 1;
    // var y = now.getFullYear();
    // var date = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY').add(2, 'hours');
    // date = date.toISOString();
    return now.toISOString();
};

exports.getFutureDateTime = function(days) {
    var future = new Date();
    future.setDate(future.getDate() + days);
    var newdate = future;
    var m = newdate.getMonth() + 1;
    var d = newdate.getDate();
    m = (m > 9 ? m : ('0' + m));
    m = m.toString();
    d = (d > 9 ? d : ('0' + d));
    d = d.toString();
    var fdate = newdate.getFullYear() + '-' + m + '-' + d + 'T23:59:59.000Z';
    return fdate;
};

exports.getNextDaysDate = function(days) {
    var future = new Date();
    future.setDate(future.getDate() + days);
    var newdate = future;
    var m = newdate.getMonth() + 1;
    var d = newdate.getDate();
    m = (m > 9 ? m : ('0' + m));
    m = m.toString();
    d = (d > 9 ? d : ('0' + d));
    d = d.toString();
    var fdate = d + '/' + m + '/' + newdate.getFullYear();
    return fdate;
};

exports.updateAfterAddingDays = function(date, days) {
    var newdate = moment(date).add(days, 'days');
    var m = newdate.month() + 1;
    var d = newdate.date();
    m = (m > 9 ? m : ('0' + m));
    m = m.toString();
    d = (d > 9 ? d : ('0' + d));
    d = d.toString();
    var fdate = newdate.year() + '-' + m + '-' + d + 'T23:59:59.000Z';
    return fdate;
};

exports.convertToIOSDate = function(date) {
    var dd = date.split('/');
    var m = parseInt(dd[0]);
    m = (m > 9 ? m : ('0' + m));
    m = m.toString();
    var d = parseInt(dd[1]);
    d = (d > 9 ? d : ('0' + d));
    d = d.toString();
    var y = dd[2];
    y = y.toString();
    var fdate = y + '-' + m + '-' + d + 'T' + moment().toISOString().split('T')[1];
    return fdate;
};

exports.getLastMonthAfterAddingDays = function(days) {
    var newdate = moment().subtract(1, 'months').add(days, 'days');
    var m = newdate.month() + 1;
    var d = newdate.date();
    m = (m > 9 ? m : ('0' + m));
    m = m.toString();
    d = (d > 9 ? d : ('0' + d));
    d = d.toString();
    var fdate = newdate.year() + '-' + m + '-' + d + 'T23:59:59.000Z';
    return fdate;
};

exports.getHoursDifference = function(pastDate) {
    var now = moment();
    var pastDate1 = moment(pastDate);
    return parseInt(now.diff(pastDate1, 'hours'));
};

exports.getBusinessPrice = function(finalPrice, price1, price2, relativePrice) {
    finalPrice = finalPrice || 0;
    price1 = price1 || 0;
    price2 = price2 || 0;
    relativePrice = relativePrice || 0;
    return parseFloat((finalPrice * relativePrice) / (price1 + price2));
};

exports.getMonthsDifference = function(pastDate) {
    return parseInt(moment(new Date()).diff(moment(pastDate), 'months', true));
};

exports.getDateAfterSubtractDays = function(date, days) {
    return moment(date).subtract(days, 'days').toISOString();
};

exports.getMonthsAfterDate = function(months) {
    return moment().add(months, 'months').toISOString();
};

exports.getYearAfterDate = function(years) {
    return moment().add(years, 'years').toISOString();
};

exports.getNextMinuteDateTime = function(minutes) {
    var future = new Date();
    future.setMinutes(future.getMinutes() + minutes);
    return future.toISOString();
};

exports.getEndDate = (count, type) => {
    return moment().subtract(count, type).format('YYYY-MM-DD');
};

exports.getGraphDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
};

exports.getDateRange = () => {
    const today = moment();
    const date24 = moment('12-23-2021', 'MM-DD-YYYY');
    const date3dec = moment('1-3-2022', 'MM-DD-YYYY');
    const test = moment(today).isBetween(date24, date3dec);
    return test;
};

exports.getDateTimeFormate = function(d, time) {
    var now = new Date(d);
    var d1 = now.getDate();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();
    var date = moment(m + '-' + d1 + '-' + y, 'MM-DD-YYYY').format('DD/MM/YYYY');
    var t = convertTo12Hours(time);
    return date + ' ' + t;
};

exports.dateNumberFormate = function(d) {
    var now = new Date(d);
    var d1 = now.getDate();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();
    m = (m > 9 ? m : ('0' + m));
    m = m.toString();
    d1 = (d1 > 9 ? d1 : ('0' + d1));
    d1 = d1.toString();
    return (y + m + d1);
};

exports.getDateFormate = function(d1) {
    var now = new Date(d1);
    var d = now.getDate();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();
    var date = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY').format('DD/MM/YYYY');
    return date;
};

exports.getCurrentTime = function() {
    var now = new Date();
    return (now.getHours() + ':' + now.getMinutes());
};

exports.formateCurrencyEURPrice = function(price) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    // return currencyFormatter.format(price, { code: 'EUR' });
};
exports.getDaysDifferenceFromToday = function(expiryDate) {
    var today = moment();
    var nextDate = new Date(expiryDate);
    var d = nextDate.getDate();
    var m = nextDate.getMonth() + 1;
    var y = nextDate.getFullYear();
    var nextDate1 = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY');
    return nextDate1.diff(today, 'days');
};

exports.getZoneCurrentTime = function() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    return ((h < 10 ? ('0' + h) : h) + ':' + (m < 10 ? ('0' + m) : m));
};

exports.uploadFile = (fileObject, target, fileName, callback) => {
    var data = fileObject;
    var path = target + fileName;
    var file = fs.createWriteStream(path);
    file.on('error', function(err) {
        if (err) { callback(false); }
    });
    data.pipe(file);
    data.on('end', function(err) {
        if (!err) {
            callback(fileName);
        } else {
            callback(false);
        }
    });
};

exports.uploadBufferTOS3 = async(fileBuffer, filename, contentType, mode) => {
    // Create S3 Client
    var client = knox.createClient({
        key: Config.s3.AWS_ACCESS_KEY,
        secret: Config.s3.AWS_SECRET_ACCESS_KEY,
        bucket: (mode == 'resized') ? Config.s3.prodResizedBucketName : Config.s3.prodBucketName
    });
    return new Promise(async(resolve, reject) => {
        var s3ClientOptions = {
            'Content-Type': contentType || ''
            // 'x-amz-acl': 'public-read'
        };
        // Use the Sharp module to resize the image and save in a buffer.
        try {
            client.putBuffer(fileBuffer, filename, s3ClientOptions, function(err, result) {
                if (err) {
                    return resolve(false);
                }
                return resolve(result.req.url);
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    });
};

exports.uploadDocsTOS3 = async(fileData, filename, contentType) => {
    // Create S3 Client
    var client = knox.createClient({
        key: Config.s3.AWS_ACCESS_KEY,
        secret: Config.s3.AWS_SECRET_ACCESS_KEY,
        bucket: Config.s3.docsBucketName
    });
    return new Promise((resolve, reject) => {
        var s3ClientOptions = {
            'Content-Type': contentType || ''
            // 'x-amz-acl': 'public-read'
        };
        client.putFile(fileData, filename, s3ClientOptions, function(err, result) {
            if (err) {
                return resolve(false);
            }
            if (result.req.url) {
                fs.unlink(Config.staticPaths.uploadFile + fileData.filename, function(err) {});
            }
            return resolve(result.req.url);
        });
    });
};

exports.uploadTOS3 = async(fileData, filename, contentType, mode) => {
    // Create S3 Client
    var client = knox.createClient({
        key: Config.s3.AWS_ACCESS_KEY,
        secret: Config.s3.AWS_SECRET_ACCESS_KEY,
        bucket: (mode == 'resized') ? Config.s3.prodResizedBucketName : Config.s3.prodBucketName
    });
    return new Promise((resolve, reject) => {
        var s3ClientOptions = {
            'Content-Type': contentType || ''
            // 'x-amz-acl': 'public-read'
        };
        client.putFile(fileData, filename, s3ClientOptions, function(err, result) {
            // console.log(err, ' err')
            if (err) {
                return resolve(false);
            }
            if (result.req.url) {
                fs.unlink(Config.staticPaths.uploadFile + fileData.filename, function(err) {});
            }
            // console.log(result,'result.req.url')
            return resolve(result.req.url);
        });
    });
};

exports.uploadQRCodeTOS3 = async(fileBuffer, filename, contentType) => {
    // Create S3 Client
    var client = knox.createClient({
        key: Config.s3.AWS_ACCESS_KEY,
        secret: Config.s3.AWS_SECRET_ACCESS_KEY,
        bucket: Config.s3.prodBucketName
    });
    return new Promise((resolve, reject) => {
        var s3ClientOptions = {
            'Content-Type': contentType !== '' ? contentType : ''
            // 'x-amz-acl': 'public-read'
        };
        client.putBuffer(fileBuffer, filename, s3ClientOptions, function(err, result) {
            if (err) {
                return resolve('');
            }
            return resolve(result.req.url);
        });
    });
};

exports.reszieLargeSizeAndUploadTOS3 = async(fileData, filename, contentType, mode, swidth, sheight) => {
    // Create S3 Client
    var client = knox.createClient({
        key: Config.s3.AWS_ACCESS_KEY,
        secret: Config.s3.AWS_SECRET_ACCESS_KEY,
        bucket: (mode == 'resized') ? Config.s3.prodResizedBucketName : Config.s3.prodBucketName
    });
    return new Promise(async(resolve, reject) => {
        var s3ClientOptions = {
            'Content-Type': contentType || ''
            // 'x-amz-acl': 'public-read'
        };
        // Use the Sharp module to resize the image and save in a buffer.
        try {
            var buffer = await sharp(fileData).resize({ width: (swidth || null), height: (sheight || null), quality: 30 }).toBuffer();
            client.putBuffer(buffer, filename, s3ClientOptions, function(err, result) {
                if (err) {
                    return resolve(false);
                }
                if (result.req.url) {
                    fs.unlink(Config.staticPaths.uploadFile + fileData.filename, function(err) {});
                }
                return resolve(result.req.url);
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    });
};

exports.reszieLogoAndUploadTOS3 = async(fileData, filename, contentType, mode, swidth) => {
    // Create S3 Client
    var client = knox.createClient({
        key: Config.s3.AWS_ACCESS_KEY,
        secret: Config.s3.AWS_SECRET_ACCESS_KEY,
        bucket: (mode == 'resized') ? Config.s3.prodResizedBucketName : Config.s3.prodBucketName
    });
    return new Promise(async(resolve, reject) => {
        var s3ClientOptions = {
            'Content-Type': contentType || ''
            // 'x-amz-acl': 'public-read'
        };
        // Use the Sharp module to resize the image and save in a buffer.
        try {
            var buffer = await sharp(fileData).resize({ width: (swidth || 100) }).toBuffer();
            client.putBuffer(buffer, filename, s3ClientOptions, function(err, result) {
                if (err) {
                    return resolve(false);
                }
                if (result.req.url) {
                    fs.unlink(Config.staticPaths.uploadFile + fileData.filename, function(err) {});
                }
                return resolve(result.req.url);
            });
        } catch (error) {
            console.log(error);
            return false;
        }
    });
};

exports.removeFileFromS3 = async(image, mode) => {
    const client = knox.createClient({
        key: Config.s3.AWS_ACCESS_KEY,
        secret: Config.s3.AWS_SECRET_ACCESS_KEY,
        bucket: (mode == 'resized') ? Config.s3.prodResizedBucketName : Config.s3.prodBucketName
    });
    var imgkey = '';
    if (image) {
        var url = image.split('/');
        imgkey = url[url.length - 1];
    }
    return new Promise((resolve, reject) => {
        client.del(imgkey || image).on('response', function(res) {
            // console.log(res, 'res delete')
            return resolve(true);
        }).end();
    });
};

exports.checkDistanceFromStore = (originAddress, callback) => {
    var origins = [originAddress.address, originAddress.address.lng + ',' + originAddress.address.lat];
    var result = {
        status: false,
        distance: 0,
        error: ''
    };
    distance.matrix(origins, destinations, function(err, distances) {
        if (err) {
            result.error = err;
            callback(result);
        }
        if (!distances) {
            result.err = 'No distances';
            console.log('no distances');
            callback(result);
        }
        if (distances.status == 'OK') {
            result.status = true;
            result.distance = distances.rows[0].elements[0].distance;
            callback(result);
        } else {
            callback(result);
        }
    });
};

exports.getTodayDeliveryDate = function() {
    var now = new Date();
    var d = now.getDate();
    var m = now.getMonth() + 1;
    var y = now.getFullYear();
    var date = moment(m + '-' + d + '-' + y, 'MM-DD-YYYY').add(0, 'days').format('DD/MM/YYYY');
    return date;
};

exports.getDateFormat = (date, format) => {
    date = date || moment().format('YYYY-MM-DD');
    const result = moment(date).format(format);
    return result;
};

exports.getMMDateFormat = (date) => {
    var newdate = new Date(date);
    var m = newdate.getMonth() + 1;
    var d = newdate.getDate();
    m = (m > 9 ? m : ('0' + m));
    m = m.toString();
    d = (d > 9 ? d : ('0' + d));
    d = d.toString();
    var fdate = newdate.getFullYear() + '-' + m + '-' + d;
    return fdate;
};

exports.getOrderStatus = (data) => {
    switch (data) {
        case 1:
            return 'Initiated';
            break;
        case 2:
            return 'Completed';
            break;
        case 3:
            return 'Cancelled';
            break;
        case 4:
            return 'Refunded';
            break;
        default:
            return '';
            break;
    }
};

exports.getVatPercentage = (countryCode, userType, productType) => {
    if (productType === 'EventELite') {
        return 7.7;
    } else {
        switch (countryCode) {
            case 'IT':
                return (userType === 'Private') ? 22 : 0;
                break;
            case 'CH':
                return 7.7;
                break;
            default:
                return 0;
                break;
        }
    }
};

exports.getVatPrice = (percent, total) => {
    return parseFloat((total / (1 + (percent / 100))).toFixed(2));
};