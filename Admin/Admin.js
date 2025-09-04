const admin = require("express").Router();
const auth = require("./Auth/Auth");
const main = require("./Main/Main");

admin.use("/auth", auth);
admin.use("/", main);

module.exports = admin;
