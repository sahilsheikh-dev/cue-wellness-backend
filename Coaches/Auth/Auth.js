const auth = require("express").Router();
const Coach = require("../../Database/coach/coachSchema");
const CoachUnverified = require("../../Database/coach/coachUnverified.js");
const Error = require("../../Database/system/error");
const getId = require("../../essentials/getId");
const OTP = require("../../essentials/otp");
const { encrypt, decrypt } = require("../../essentials/cryptography");
const enu = require("../../essentials/enu");
const Languages = require("../../Database/app/Languages.js");
const Connection = require("../../Database/connection/Connections.js");
const Numbers = require("../../Database/app/Numbers.js");
const multer = require("multer");
const path = require("path");

const twilio = require("twilio");

const accountSid = "ACc86102fc09260ed1cc341237ddfa2aeb";
const authToken = "56f6d1015cfee877def7f1b1987417ca";
const verifySid = "VA4a0b9a2e84100362aaf4781ec8faf191";
const client = twilio(accountSid, authToken);

async function send_otp(phone) {
  await client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phone, channel: "sms" });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "treasure/"); // ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "certificate_" + getId(12) + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
      await Numbers.findOne({ name: "eo" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "pc":
      await Numbers.findOne({ name: "pc" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
  }
}

auth.get("/", (req, res) => {
  res.send("this is the auth section for the coaches");
});

auth.post("/signup", async (req, res) => {
  const { name, contact, password } = req.body;
  if (enu(name, contact, password)) {
    // num_of_coach = await  Numbers.find({name:"coach_unverified"});
    Coach.findOne({ mobile: contact })
      .then(async (coach_data) => {
        if (coach_data == undefined) {
          let otp = OTP(contact);
          let otpId = getId(12);
          send_otp(contact);
          const newCoach = new CoachUnverified({
            coach_id: await give_me_next_code("coach_unverified"),
            name: encrypt(name),
            mobile: contact,
            password: encrypt(password),
            otp: encrypt(otp),
            otpId: otpId,
          });
          await newCoach.save();
          increment_code("coach_unverified");
          res.send({
            res: true,
            otpId: encrypt(otpId),
          });
        } else {
          res.send({
            res: false,
            alert: "Mobile number already registered",
          });
        }
      })
      .catch(async (err) => {
        console.log(err);
        const newError = new Error({
          name: "user signup error",
          file: "users/auth.js",
          description: "was not able to find user in the database + " + err,
          dateTime: new Date(),
          section: "users",
          priority: "low",
        });
        await newError.save();
        res.send({ server: true, res: false, alert: "Something went wrong" });
      });
  } else {
    res.send({
      res: false,
      alert: "Please fill all the fields",
    });
  }
});

auth.post("/otp", async (req, res) => {
  const { otp, otpId } = req.body;
  CoachUnverified.findOne({
    otpId: decrypt(otpId),
  }).then(async (coach_data) => {
    if (coach_data == undefined) {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    } else {
      const verificationCheck = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: coach_data.mobile, code: otp });
      if (verificationCheck.status == "approved") {
        let newToken = getId(12);
        CoachUnverified.updateOne(
          { _id: coach_data._id },
          {
            $set: {
              token: newToken,
              mobileVerified: true,
            },
          }
        )
          .then((result) => {
            res.send({ res: true, token: encrypt(newToken) });
          })
          .catch(async (err) => {
            const newError = new Error({
              name: "coach otp section",
              file: "coach/auth.js",
              description: "was not able to put token+ " + err,
              dateTime: new Date(),
              section: "coach",
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
    await CoachUnverified.findOne({
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
          await CoachUnverified.findOneAndUpdate(
            { _id: user._id },
            { otp: encrypt(otp) }
          )
            .then(() => {
              res.send({ server: true, res: true });
            })
            .catch(async (err) => {
              const newError = new Error({
                name: "resend error",
                file: "coach/auth.js",
                description:
                  "the error occured when the coach wanted to resend the otp + " +
                  err,
                dateTime: new Date(),
                section: "coach",
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
      })
      .catch(async (err) => {
        const newError = new Error({
          name: "resend error",
          file: "coach/auth.js",
          description:
            "the error occured when we were finding a caoch to resend otp + " +
            err,
          dateTime: new Date(),
          section: "coach",
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

auth.post("/build-profile", async (req, res) => {
  let [month, day, year] = req.body.dob.split("-").map(Number);
  let dob = new Date(year, month - 1, day);
  if (
    enu(
      req.body.email,
      req.body.dob,
      req.body.gender,
      req.body.pin_code,
      req.body.country,
      req.body.city,
      req.body.address,
      req.body.experience,
      // req.body.level,
      req.body.category,
      // req.body.cvv,
      // req.body.expiry_date,
      // req.body.card_number,
      // req.body.card_holder_name,
      // req.body.cue_share,
      // req.body.coach_share,
      req.body.token,
      req.body.languages,
      req.body.client_gender
    )
  ) {
    CoachUnverified.findOneAndUpdate(
      { token: decrypt(req.body.token) },
      {
        email: encrypt(req.body.email),
        dob: dob,
        gender: encrypt(req.body.gender),
        pinCode: encrypt(req.body.pin_code),
        country: req.body.country,
        city: encrypt(req.body.city),
        address: encrypt(req.body.address),
        experience_year: encrypt(req.body.experience.year),
        experience_months: encrypt(req.body.experience.months),
        // levelOfExpertise: req.body.level.map((item) => encrypt(item)),
        category: req.body.category.map((item) => ({
          id: item.id,
          levelOfExpertise: item.clt, // assuming item.clt is an array like ['Beginner', 'Advanced']
        })),
        // cvv: encrypt(req.body.cvv),
        // expiry_date: encrypt(req.body.expiry_date),
        // card_number: encrypt(req.body.card_number),
        // card_holder_name: encrypt(req.body.card_holder_name),
        // cue_share: encrypt(req.body.cue_share),
        // coach_share: encrypt(req.body.coach_share),
        client_gender: req.body.client_gender.map((item) => encrypt(item)),
        languages: req.body.languages.map((item) => item._id),
        get_verified: true,
      }
    )
      .then(async (result) => {
        res.send({ server: true, res: true });
      })
      .catch(async (err) => {
        console.log(err);
        const newError = new Error({
          name: "build coach profile",
          file: "coach/auth.js",
          description:
            "the error occured when the coach was building their profile + " +
            err,
          dateTime: new Date(),
          section: "coach",
          priority: "low",
        });
        await newError.save();
        res.send({ server: true, res: false, alert: "Something went wrong" });
      });
  } else {
    res.send({
      server: true,
      res: false,
      alert: "Please fill all the details",
    });
  }
});

auth.post("/get-languages", async (req, res) => {
  await Languages.find({}).then((all_languages) => {
    for (let i = 0; i < all_languages.length; i++) {
      all_languages[i].name = decrypt(all_languages[i].name);
    }

    res.send({ server: true, res: true, supply: all_languages });
  });
});

auth.post("/get-connections", async (req, res) => {
  if (enu(req.body.pass) && req.body.pass == "cue_wellness_app") {
    await Connection.find({ layer: 1 }).then((all_connections) => {
      for (let i = 0; i < all_connections.length; i++) {
        all_connections[i].title = decrypt(all_connections[i].title);
      }

      res.send({ server: true, res: true, supply: all_connections });
    });
  } else {
    res.send({
      server: true,
      res: false,
      alert: "You are not authorised to view this information",
    });
  }
});

auth.post("/get-sub-connections", async (req, res) => {
  if (
    enu(req.body.pass, req.body.connection) &&
    req.body.pass == "cue_wellness_app"
  ) {
    await Connection.find({ outer_id: req.body.connection }).then(
      (all_sub_connections) => {
        for (let i = 0; i < all_sub_connections.length; i++) {
          all_sub_connections[i].title = decrypt(all_sub_connections[i].title);
        }

        res.send({ server: true, res: true, supply: all_sub_connections });
      }
    );
  } else {
    res.send({
      server: true,
      res: false,
      alert: "You are not authorised to view this information",
    });
  }
});

auth.post("/save-certificates", upload.array("images", 10), (req, res) => {
  CoachUnverified.findOne({
    token: decrypt(req.headers["authorization"]),
  }).then((coach_data) => {
    if (coach_data == null) {
      res.send({ server: true, res: false });
    } else {
      let all_certi = [];
      req.files.map((item) => {
        all_certi.push(item.filename);
      });
      CoachUnverified.findByIdAndUpdate(coach_data._id, {
        certificates: [...all_certi],
      }).then(() => {
        res.send({ server: true, res: true });
      });
    }
  });
  // res.send({ message: "Upload successful", files: req.files });
});

auth.post("/save_agreement", (req, res) => {
  CoachUnverified.findOne({ token: decrypt(req.body.token) })
    .then(async (co) => {
      if (enu(req.body.title, req.body.content)) {
        await CoachUnverified.findByIdAndUpdate(co._id, {
          agreement_terms: {
            title: encrypt(req.body.title),
            content: req.body.content.map((item) => {
              return {
                type: encrypt(item.type),
                content: encrypt(item.content),
              };
            }),
          },
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the details",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

module.exports = auth;
