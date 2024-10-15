'use strict';
const Config = require('../config/config');
const asyncLoop = require('node-async-loop');
const sgridMail = require('sendgrid')(Config.Sendgrid.apiKey);
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var sgTransport = require('nodemailer-sendgrid-transport');
const config = require('../config/config');
const path = require('path')

const sendEmail =  (to, options, template) => {
    var optionsData = {
        viewEngine: {
            extname: '.html',
            layoutsDir: 'lib/templates/',
            defaultLayout: template,
            partialsDir: 'lib/templates/'
        },
        viewPath: 'lib/templates/',
        extName: '.html'
    };
    //using sendgrid as transport, but can use any transport.
    var send_grid = {
        auth: {
            api_key: Config.Sendgrid.apiKey
        }
    }
    var mailer = nodemailer.createTransport(sgTransport(send_grid));
    mailer.use('compile', hbs(optionsData));
    var emailBodyOptions = {
        from: options.From?options.From:Config.Sendgrid.from,
        to: to.email,
        subject: options.subject || options.Subject,
        template: template,
        context: {
            name: to.name,
            to: to,
            options: options,
            MailSetting: Config.MailSetting
        }
    };
    if(to.replyTo) {
        emailBodyOptions.replyTo = to.replyTo;
    }
    mailer.sendMail(emailBodyOptions, function (error, response) {
        if(error) {
            console.log("Error in sent email to "+ to.email, error);
        } else {
            console.log("Mail sent!! to "+ to.email);
        }
        mailer.close();
    });
};

const sendBulkEmail =  (recipients, req, res, template, data, otherData) => {
    var nodemailer = require('nodemailer');
    var hbs = require('nodemailer-express-handlebars');
    var optionsData = {
        viewEngine: {
            extname: '.html',
            layoutsDir: 'lib/templates/',
            defaultLayout : template,
            partialsDir : 'lib/templates/'
        },
        viewPath: 'lib/templates/',
        extName: '.html'
    };
    var sgTransport = require('nodemailer-sendgrid-transport');
    //using sendgrid as transport, but can use any transport.
    var send_grid = {
        auth: {
            api_key: Config.Sendgrid.apiKey
        }
    }
    var c=1;
    asyncLoop(recipients, function (to, next) {
        var lng = to.language ? to.language : 'it';
        var lang = lng.toUpperCase();
        var opts = res.__({phrase: 'NewsInformationSend', locale: lng});
        var others = {};
        others.investmentTitle =  otherData['title'+lang];
        others.investmentDescription = otherData['description'+lang];
        others.link = Config.webAppBaseUrl+'/investdetail/' + otherData._id + '?tab=news';
        var mailer = nodemailer.createTransport(sgTransport(send_grid));
        mailer.use('compile', hbs(optionsData));
        mailer.sendMail({
            from: Config.Sendgrid.from,
            to: to.email,
            subject: opts.Subject + others.investmentTitle,
            template: template,
            context: {
                name: to.fullName,
                to: to,
                news: data,
                options: opts,
                others: others,
                MailSetting: Config.MailSetting
            }
        }, function (error, response) {
            if(error) {
                console.log(c+ "  Error in sent email to "+ to.email, error);
            } else {
                console.log(c+"  Mail sent!! to "+ to.email);
            }
            mailer.close();
            c++;
            next();
        });
    }, function (err) {
        if (err) {
            console.error('Error in sending: ' + err);
        }
        console.log('Error: Finished!'+  err);
    });
};

const sendGridMail = (value, mailbody, maildata, optionaldata) => {
    var optionsData = {
      viewEngine: {
        extname: '.html',
        layoutsDir: 'lib/templates',
        defaultLayout: mailbody,
        partialsDir: 'lib/templates',
      },
      viewPath: 'lib/templates',
      extName: '.html',
    };
    var sgTransport = require('nodemailer-sendgrid-transport');
    //using sendgrid as transport, but can use any transport.
    var send_grid = {
      auth: {
            api_key: sgridMail
        // api_key: Config.sendGrid.apiKey
      },
    };
    var mailer = nodemailer.createTransport(sgTransport(send_grid));
    mailer.use('compile', hbs(optionsData));
    mailer.sendMail({
        from: Config.sendGrid.from,
        to: value.contactus ? value.email1 : value.email,
        cc: mailbody === Config.emailOptions.adminContactus.template ? 'support@newestateonly.com' : '',
        bcc: 'neosystemmessage@gmail.com',
        subject: maildata.subject, // Subject line
        template: mailbody, // html body
        context: {
            firstname: value.firstName,
            lastname: value.lastName,
            link: value.link,
            value: value,
            maildata: maildata,
            logo: Config.staticPaths.logoUrl,
            facebook: Config.staticPaths.facebookUrl,
            instagram: Config.staticPaths.instagramUrl,
            youtube: Config.staticPaths.youtubeUrl,
            linkedin: Config.staticPaths.linkedinUrl,
            projectName: Config.projectName,
            optionaldata: optionaldata,
        },
    },
    function (error, response) {
        if (error) {
          console.log('Error in sent email to ' + value.email, error);
        } else {
          console.log('Mail sent!! to ' + value.email);
        }
        mailer.close();
      }
    );
  };

exports.sendEmailBySendgrid = (to, options, template) => {
    return sendEmail(to, options, template);
};

exports.sendEmailToMany = (recipients, req, res, template, data, otherData) => {
    return sendBulkEmail(recipients, req, res, template, data, otherData);
};

exports.sendGridEmail = (value, mailbody, maildata, optionaldata) => {
    return sendGridMail(value, mailbody, maildata, optionaldata);
};

