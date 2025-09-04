const auth = require("express").Router();
const Admin = require("../../Database/admin/adminSchema");
const Error = require("../../Database/system/error");
const enu = require("../../essentials/enu");
const getId = require("../../essentials/getId");
const { decrypt, encrypt } = require("../../essentials/cryptography");

auth.post("/add-admin", async (req, res) => {
  const headers = req.headers;
  Admin.findOne({ token: headers.token }).then((admin_data) => {
    if (admin_data == undefined) {
      res.send({
        server: true,
        res: false,
        alert: "Access denied",
        redirect: "/login",
      });
    } else {
      console.log("found the token");
      // add the admin here
    }
  });
});

auth.post("/login", async (req, res) => {
  const { mobile, password } = req.body;
  if (enu(mobile, password)) {
    await Admin.findOne({
      mobile: mobile,
    })
      .then(async (admin_data) => {
        if (admin_data == undefined) {
          res.send({
            server: true,
            res: false,
            alert: "Mobile number or password is incorrect",
          });
        } else {
          if (password == decrypt(admin_data.password)) {
            let new_token = getId(12);
            await Admin.findByIdAndUpdate(admin_data._id, {
              token: new_token,
            });

            console.log("we are setting the cookies here");

            res.cookie("AuthToken", encrypt(new_token), {
              httpOnly: true,
              maxAge: 24 * 60 * 60 * 1000,
              secure: true,
              sameSite: "None",
            });

            // res.cookie("AuthToken", encrypt(new_token), {
            //   httpOnly: true,
            //   secure: false,
            //   sameSite: "Lax",
            // });

            console.log(res);

            res.send({
              res: true,
              server: true,
              supply: {
                token: encrypt(new_token),
              },
            });
          } else {
            res.send({
              server: true,
              res: false,
              alert: "Mobile number or password is incorrect",
            });
          }
        }
      })
      .catch((error) => {
        const newError = new Error({
          name: "admin login",
          file: "admin/auth/auth.js",

          description:
            "the error occured when the system was trying to find the admin in the database but was not able to find the actual error is :- " +
            error,
          dateTime: new Date(),
          section: "admin",
          priority: "low",
        });
        newError.save();
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong, please try again",
        });
      });
  } else {
    res.send({
      res: false,
      server: true,
      alert: "Please fill all the details",
    });
  }
});

auth.post("/check-cookie", (req, res) => {
  let cookies = req.cookies;
  if (enu(cookies.AuthToken)) {
    Admin.findOne({
      token: decrypt(cookies.AuthToken),
    })
      .then((result) => {
        if (result == null) {
          res.send({ server: true, res: false });
        } else {
          res.send({ server: true, res: true, redirect: "/dashboard" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.send({ server: true, res: false });
  }

  // res.cookie("testCookie", "hello-world", {
  //   httpOnly: true,
  //   secure: true, // Ensures it's only sent over HTTPS
  //   sameSite: "None",
  //   expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  // });
  // res.send("Cookie set!");
});

module.exports = auth;
