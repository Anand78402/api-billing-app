const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports.login = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});

module.exports.signup = Joi.object({
    userName: Joi.string().required().alphanum().min(6).max(20),
    email: Joi.string().required().email().regex(/^[A-Za-z0-9._-]+@[A-Za-z0-9-_]+\.[A-Za-z.]{2,5}$/),
    password: Joi.string().required().regex(/^[a-zA-Z0-9?=.*!@#$%^&*_\-\s]{3,30}$/).min(6).max(15),
    firstName: Joi.string().required(),
    adminType: Joi.number().required().valid(2)
});



module.exports.login = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});
