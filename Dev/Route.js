const auth = require("express").Router();
// const Ad = require("../../Database/ad/adSchema");
const getId = require("../../essentials/getId");
const OTP = require("../../essentials/otp");
const Error = require("../../Database/system/error");
const enu = require("../../essentials/enu");
const { encrypt, decrypt } = require("../../essentials/cryptography");

auth.post("/", (req, res) => {});

module.exports = auth;
