const Joi = require('joi');

module.exports.addKey = Joi.object({
    secretKey : Joi.string().required()
});

module.exports.addAppKey = Joi.object({
    applicationKey : Joi.string().required()
});
