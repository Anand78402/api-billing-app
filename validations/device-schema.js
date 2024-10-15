const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.create = Joi.object({
    deviceName: Joi.string().required(),
    deviceCode: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    user: Joi.string().required()
});

module.exports.update = Joi.object({
    deviceName: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    deviceCode: Joi.string().required(),
    user: Joi.string().required()
});

