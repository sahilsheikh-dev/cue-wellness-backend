const product = require("express").Router();
const auth = require("./Auth/Auth");
const main = require("./Main/Main");

product.use("/auth", auth);
product.use("/", main);
module.exports = product;
