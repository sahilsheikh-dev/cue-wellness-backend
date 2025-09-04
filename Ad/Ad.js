const Ad = require("express").Router();
const auth = require("./Auth/Auth");
const main = require("./Main/Main");

Ad.use("/auth", auth);
Ad.use("/", main);
module.exports = Ad;
