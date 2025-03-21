const otpGenerator = require("otp-generator");

function generateOTP() {
  return otpGenerator.generate(6, {
    numbers: true,
    digits: true,
    lowerCaseAlphabets: false,
    upperCase: false,
    specialChars: false,
    upperCaseAlphabets: false,
    alphabets: false,
  });
}

module.exports = generateOTP;
