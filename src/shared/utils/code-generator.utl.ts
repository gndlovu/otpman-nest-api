import { AppConstants } from "./constants";

export const generateOTP = (): string => {
    const digits = AppConstants.OTP_DIGITS;
    let otp = '';

    for (let i = 0; i < +AppConstants.OTP_MAX_SIZE; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }

    return otp;
};