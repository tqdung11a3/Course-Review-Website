const crypto = require("crypto");

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
}

function verifyOtp(otp, hash) {
  return hashOtp(otp) === hash;
}

module.exports = { generateOtp, hashOtp, verifyOtp };
