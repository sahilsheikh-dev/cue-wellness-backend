const users = require("express").Router();
const Auth = require("./Auth/Auth");
const Main = require("./Main/Main");

users.use("/auth", Auth);
users.use("/", Main);
module.exports = users;
