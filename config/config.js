'use strict';

const dotenv = require('dotenv');
dotenv.config();

const projectName = process.env.PROJECT_NAME;
const port = process.env.PORT;
const baseUrl = process.env.BASE_URL;
const logoUrl = process.env.LOGO_URL;
const webAppBaseUrl = process.env.WEB_BASE_URL;
const adminBaseUrl = process.env.ADMIN_BASE_URL;
const chemAPIURL= process.env.CHEMICAL_APP_API_URL;

module.exports = {
    env: process.env.ENV,
    baseUrl: baseUrl,
    webAppBaseUrl: webAppBaseUrl,
    adminBaseUrl: adminBaseUrl,
    chemAPIURL: chemAPIURL, 
    server: {
        host: process.env.HOST,
        port: port
    },
    product: {
        name: projectName
    },
    timeZone: process.env.TIMEZONE,
    key: {
        IV: process.env.IV_KEY,
        privateKey: process.env.PRIVATE_KEY,
        tokenExpiry: 1 * 30 * 1000 * 60 * 24 // 24 hour,
    },
    mongodb: {
        url: process.env.MONGO_DB_URL
    },
    deaultSuperAdmin: {
        firstName: process.env.SUPER_ADMIN_FIRST_NAME,
        lastName: process.env.SUPER_ADMIN_LAST_NAME,
        fullName: process.env.SUPER_ADMIN_FULL_NAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        userType: process.env.SUPER_ADMIN_USERTYPE,
        isEmailVerified: process.env.SUPER_ADMIN_EMAIL_VERIFIED
    },
    MailSetting: {
        logoUrl: logoUrl + '/lib/templates/logo.png',
        thanks: 'Thanks,',
        companyTeam: 'Freeasy Team',
        footer: 'Copyright © ' + new Date().getFullYear() + 'Freeasy',
        supportEmail: process.env.MAIL_SETTING_SUPPORT_MAIL
    },
    Sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      fromapp: process.env.SENDGRID_FROM_APP
    },
    s3: {
        AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        prodBucketName: process.env.AWS_PROD_BUCKET_NAME,
        docsBucketName: process.env.AWS_DOCS_BUCKET_NAME,
        dbBackupName: process.env.AWS_DB_BACKUP_NAME,
        region: process.env.AWS_REGION,
        dbAccessPerm: process.env.AWS_DB_ACCESS_PERM
    },
    staticPaths: {
        uploadFile: process.cwd() + '/uploads/',
        file: baseUrl + 'uploads/'
    }
};