const coaches = require("express").Router();

const auth = require("./Auth/Auth");
const main = require("./Main/Main");

coaches.use("/auth", auth);
coaches.use("/", main);
module.exports = coaches;
