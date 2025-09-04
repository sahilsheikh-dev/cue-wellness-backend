const auth = require("express").Router();
const Ad = require("../../Database/ad/adSchema");
const AdUnverified = require("../../Database/ad/adUnverifiedSchema");
const getId = require("../../essentials/getId");
const OTP = require("../../essentials/otp");
const Error = require("../../Database/system/error");
const enu = require("../../essentials/enu");
const { encrypt, decrypt } = require("../../essentials/cryptography");
const Numbers = require("../../Database/app/Numbers.js");
const twilio = require("twilio");

const accountSid = "ACc86102fc09260ed1cc341237ddfa2aeb";
const authToken = "56f6d1015cfee877def7f1b1987417ca";
const verifySid = "VA4a0b9a2e84100362aaf4781ec8faf191";
const client = twilio(accountSid, authToken);

async function send_otp(phone) {
  console.log(phone);
  await client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phone, channel: "sms" });
}

async function give_me_next_code(entity) {
  return new Promise((resolve, reject) => {
    switch (entity) {
      case "client":
        Numbers.findOne({ name: "client" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "CL-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "coach":
        Numbers.findOne({ name: "coach" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "CO-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "coach_unverified":
        Numbers.findOne({ name: "coach_unverified" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "COUV-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "management":
        Numbers.findOne({ name: "management" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "MNGT-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "staff":
        Numbers.findOne({ name: "staff" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "ST-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "eouv":
        Numbers.findOne({ name: "event_unverified" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "EOUV-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "eo":
        Numbers.findOne({ name: "event" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "EO-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "pc":
        Numbers.findOne({ name: "product" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "PC-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "pcuv":
        Numbers.findOne({ name: "product_unverified" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "PCUV-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
    }
  });
}

async function increment_code(entity) {
  switch (entity) {
    case "client":
      await Numbers.findOne({ name: "client" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "coach":
      await Numbers.findOne({ name: "coach" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "coach_unverified":
      await Numbers.findOne({ name: "coach_unverified" }).then(
        async (num_data) => {
          await Numbers.findByIdAndUpdate(num_data._id, {
            number: num_data.number + 1,
          });
        }
      );
      break;
    case "management":
      await Numbers.findOne({ name: "management" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "staff":
      await Numbers.findOne({ name: "staff" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "eo":
      await Numbers.findOne({ name: "event" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "eouv":
      await Numbers.findOne({ name: "event_unverified" }).then(
        async (num_data) => {
          await Numbers.findByIdAndUpdate(num_data._id, {
            number: num_data.number + 1,
          });
        }
      );
      break;
    case "pc":
      await Numbers.findOne({ name: "pc" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "pcuv":
      await Numbers.findOne({ name: "product_unverified" }).then(
        async (num_data) => {
          await Numbers.findByIdAndUpdate(num_data._id, {
            number: num_data.number + 1,
          });
        }
      );
      break;
  }
}

auth.post("/signup", (req, res) => {
  if (enu(req.body.eo_type)) {
    if (req.body.eo_type == "company") {
      Ad.findOne({ mobile: req.body.contact })
        .then(async (userData) => {
          if (userData == undefined) {
            let otp = OTP(req.body.contact);
            let otpId = getId(12);
            console.log(req.body.contact);
            send_otp(req.body.contact);
            try {
              const newAd = new AdUnverified({
                event_organizer_id: await give_me_next_code("eouv"),
                type: "company",
                company_name: encrypt(req.body.company_name),
                name: encrypt(req.body.account_operator_name),
                mobile: req.body.contact,
                country: req.body.country,
                password: encrypt(req.body.password),
                otp: encrypt(otp),
                otpId: otpId,
              });

              await newAd.save();
              increment_code("eouv");
              res.send({
                res: true,
                otpId: encrypt(otpId),
              });
            } catch (error) {
              console.log(error);
              const newError = new Error({
                name: "Ad signup error",
                file: "Ad/auth.js",
                description:
                  "was not able to insert data into database for ad new account + " +
                  error,
                dateTime: new Date(),
                section: "users",
                priority: "low",
              });
              await newError.save();
              res.send({
                res: false,
                alert: "Something went wrong, please try again",
              });
            }
          } else {
            res.send({
              res: false,
              alert: "Mobile number already registered",
            });
          }
        })
        .catch(async (err) => {
          const newError = new Error({
            name: "ad signup error",
            file: "ad/auth.js",
            description: "was not able to find ad in the database + " + err,
            dateTime: new Date(),
            section: "users",
            priority: "low",
          });
          await newError.save();
          res.send({ server: true, res: false, alert: "Something went wrong" });
        });
    } else if (req.body.eo_type == "individual") {
      Ad.findOne({ mobile: req.body.contact })
        .then(async (userData) => {
          if (userData == undefined) {
            let otp = OTP(req.body.contact);
            let otpId = getId(12);
            console.log(req.body.contact);
            send_otp(req.body.contact);
            try {
              const newAd = new AdUnverified({
                event_organizer_id: await give_me_next_code("eouv"),
                type: "individual",
                name: encrypt(req.body.name),
                mobile: req.body.contact,
                password: encrypt(req.body.password),
                otp: encrypt(otp),
                otpId: otpId,
                country: req.body.country,
              });

              await newAd.save();
              increment_code("eouv");
              res.send({
                res: true,
                otpId: encrypt(otpId),
              });
            } catch (error) {
              console.log(error);
              const newError = new Error({
                name: "Ad signup error",
                file: "Ad/auth.js",
                description:
                  "was not able to insert data into database for ad new account + " +
                  error,
                dateTime: new Date(),
                section: "users",
                priority: "low",
              });
              await newError.save();
              res.send({
                res: false,
                alert: "Something went wrong, please try again",
              });
            }
          } else {
            res.send({
              res: false,
              alert: "Mobile number already registered",
            });
          }
        })
        .catch(async (err) => {
          const newError = new Error({
            name: "ad signup error",
            file: "ad/auth.js",
            description: "was not able to find ad in the database + " + err,
            dateTime: new Date(),
            section: "users",
            priority: "low",
          });
          await newError.save();
          res.send({ server: true, res: false, alert: "Something went wrong" });
        });
    }
  } else {
    res.send({
      server: true,
      res: false,
      alert: "Something went wrong, please try again",
    });
  }
});

auth.post("/otp", async (req, res) => {
  const { otp, otpId } = req.body;
  AdUnverified.findOne({
    otpId: decrypt(otpId),
  }).then(async (userData) => {
    if (userData == undefined) {
      res.send({
        res: false,
        alert: "Unauthorized route",
        redirect: "login",
      });
    } else {
      console.log(userData);
      const verificationCheck = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: userData.mobile, code: otp });
      if (verificationCheck.status == "approved") {
        let newToken = getId(12);
        AdUnverified.updateOne(
          { _id: userData._id },
          {
            $set: {
              token: newToken,
              get_verified: true,
            },
          }
        )
          .then((result) => {
            console.log(newToken);
            console.log(encrypt(newToken));
            res.send({ res: true, token: encrypt(newToken) });
          })
          .catch(async (err) => {
            const newError = new Error({
              name: "ad signup error",
              file: "ad/auth.js",
              description: "was not able to put token in ad+ " + err,
              dateTime: new Date(),
              section: "ad",
              priority: "medium",
            });
            await newError.save();
            res.send({
              res: false,
              alert: "Something went wrong, please restart the app",
            });
          });
      } else {
        res.send({
          res: true,
          alert: "Incorrect OTP",
        });
      }
    }
  });
});

auth.post("/resend-otp", async (req, res) => {
  if (enu(req.body.otpId)) {
    await AdUnverified.findOne({
      otpId: decrypt(req.body.otpId),
    })
      .then(async (user) => {
        // console.log(user);
        // console.log(req.body.otpId);
        if (user != null) {
          console.log("here is the user");
          console.log("here is the user");
          let otp = OTP(user.mobile);
          send_otp(user.mobile);
          // here we will get the mobile and everything of the user to send a new otp into his/her mobile number
          await Ad.findOneAndUpdate({ _id: user._id }, { otp: encrypt(otp) })
            .then(() => {
              res.send({ server: true, res: true });
            })
            .catch(async (err) => {
              const newError = new Error({
                name: "resend error",
                file: "ad/auth.js",
                description:
                  "the error occured when the ad wanted to resend the otp + " +
                  err,
                dateTime: new Date(),
                section: "ad",
                priority: "low",
              });
              await newError.save();
              res.send({
                res: false,
                alert: "Something went wrong, please try again",
              });
            });
        } else {
          console.log("asdf");
          res.send({ server: true, res: false, alert: "Something went wrong" });
        }
      })
      .catch(async (err) => {
        const newError = new Error({
          name: "resend error",
          file: "ad/auth.js",
          description:
            "the error occured when we were finding a ad to resend otp + " +
            err,
          dateTime: new Date(),
          section: "users",
          priority: "low",
        });
        await newError.save();
        res.send({
          res: false,
          alert: "Something went wrong, please try again",
        });
      });
  } else {
    res.send({ server: true, res: false, alert: "Something went wrong" });
  }
});

auth.post("/is-verified", async (req, res) => {
  console.log(req.body);
  console.log(decrypt(req.body.token));
  await Ad.findOne({ token: decrypt(req.body.token) }).then(async (ad_data) => {
    if (ad_data == null) {
      await AdUnverified.findOne({ token: decrypt(req.body.token) }).then(
        (un_ad_data) => {
          console.log(un_ad_data);
          if (un_ad_data == null) {
            res.send({ server: true, res: false, logout: true });
          } else {
            res.send({ server: true, res: true, supply: false });
          }
        }
      );
    } else {
      res.send({ server: true, res: true, supply: true });
    }
  });
});

module.exports = auth;
