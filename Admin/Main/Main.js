const admin = require("express").Router();
const user = require("../Users/Users.js");
const q = require("../Questionnaire/Questionnaire.js");
const c = require("../Connection/Connection.js");
const r = require("../Reflection/Reflection.js");
const app = require("../App/App.js");
const ad = require("../Ads/Ads.js");
const shop = require("../shop/shop.js");
const admins = require("../Admins/Admins.js");
const chat = require("../Chats/chat.js");

admin.get("/", (req, res) => {
  res.send("hi guys");
});

admin.use("/users", user);
admin.use("/questionnaire", q);
admin.use("/connection", c);
admin.use("/reflection", r);
admin.use("/app", app);
admin.use("/ad", ad);
admin.use("/shop", shop);
admin.use("/admins", admins);
admin.use("/chat", chat);

module.exports = admin;
