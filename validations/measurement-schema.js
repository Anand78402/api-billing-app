const Joi = require('joi');
// Joi.objectId = require('joi-objectid')(Joi);

module.exports.createMeasurement = Joi.object({
    user: Joi.string().required(),
    device: Joi.string().required(),
    measure: Joi.number().required(),
    scale: Joi.string().valid('C', 'F').required(),
    measureDateTime: Joi.date().required()
});

module.exports.updateMeasurement = Joi.object({
    user: Joi.string().required(),
    device: Joi.string().required(),
    measure: Joi.number().required(),
    scale: Joi.string().valid('C', 'F').required(),
    measureDateTime: Joi.date().required()
});

module.exports.addDeviceMeasurement = Joi.array().items(
    Joi.object({
        deviceCode: Joi.string().required(),
        measure: Joi.number().required(),
        measureDateTime: Joi.date().required(),
        scale: Joi.string().valid('C', 'F').required(),
    })
);

module.exports.getDeviceMeasurements = Joi.object({
    deviceCode: Joi.string().required(),
    date: Joi.date().required()
});
