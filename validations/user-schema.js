const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

module.exports.signup = Joi.object({
    email: Joi.string().regex(emailRegex).required().label('Inserisci indirizzo email valido'),
    firstName: Joi.string().optional().allow(''),
    lastName: Joi.string().optional().allow(''),
    password: Joi.string().required().label('E \'richiesta la password'),
    userType: Joi.number().required().valid(2),
    isCreatedByAdmin: Joi.boolean().optional().default(false)
});

module.exports.login = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    deviceType: Joi.string().optional().valid('Web', 'Android', 'Iphone'),
    deviceId: Joi.string().optional(),
    deviceToken: Joi.string().optional()
});
module.exports.updateProfile = Joi.object({
    firstName: Joi.string().optional().allow(''),
    lastName: Joi.string().optional().allow(''),
    picture: Joi.object().optional().allow(''),
    address: Joi.string().optional().allow(''),
    zipCode: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    province: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    region: Joi.string().optional().allow('')
});
module.exports.changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(30),
    confirmPassword: Joi.string().required().min(6).max(30)
});
module.exports.forgotPassword = Joi.object({
    email: Joi.string().required()
});
module.exports.vefiryforgotPasswordCode = Joi.object({
    code: Joi.string().required()
});
module.exports.resetPassword = Joi.object({
    userId: Joi.string().required(),
    token: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(30),
    confirmPassword: Joi.string().required().min(6).max(30)
});