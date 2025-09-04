const user = require("express").Router();
const { encrypt, decrypt } = require("../../essentials/cryptography");
const User = require("../../Database/user/userSchema");
const VerifyToken = require("../Auth/VerifyToken");

user.post("/get-all-users", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then((r) => {
      let all_users = [];
      User.find({}).then((result) => {
        result.map((indi_user) => {
          let iu = {};
          iu.name = decrypt(indi_user.name);
          iu.id = indi_user._id;
          iu.contact = indi_user.mobile;
          iu.email = indi_user.email;
          iu.profile_img = indi_user.profilePicture;
          all_users.push(iu);
        });
        res.send({ server: true, res: true, supply: all_users });
      });
    })
    .catch((err) => {
      res.send({
        server: true,
        res: false,
        alert: "You are not authorised to access this information",
      });
    });
});

module.exports = user;
