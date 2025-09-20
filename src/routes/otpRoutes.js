// routes/otpRoutes.js
const express = require("express");
const router = express.Router();
const otpController = require("../controllers/otpController");
const { validateOtpId } = require("../middlewares/otpMiddleware");

// Public: send OTP (requires phone + userType)
router.post("/send", otpController.sendOtp);

// Public: verify OTP
router.post("/verify", otpController.verifyOtp);

// Public: resend OTP (requires otpId)
router.post("/resend", validateOtpId, otpController.resendOtp);

module.exports = router;
