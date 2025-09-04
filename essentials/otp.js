// this function will send the otp to the user
module.exports = function OTP(contact) {
  const otp = Math.floor(10000 + Math.random() * 90000);
  console.log(otp);
  return otp.toString();
};
