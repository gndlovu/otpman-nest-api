import * as Joi from 'joi';

export const OtpVerifySchema = Joi.object({
    userId: Joi.number().required(),
    pin: Joi.string().required(),
});
