export const jwtConstants = {
    secret: process.env.JWT_SECRET,
};

export const AppConstants = {
    OTP_DIGITS: '0123456789',
    OTP_MAX_SIZE: process.env.OTP_MAX_SIZE ?? 6,
};
