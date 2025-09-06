const enu = require("../../essentials/enu");
const auth = require("express").Router();
const User = require("../../Database/user/userSchema");
const Ad = require("../../Database/ad/adSchema.js");
const Product = require("../../Database/product/productSchema.js");
const Error = require("../../Database/system/error");
const getId = require("../../essentials/getId");
const OTP = require("../../essentials/otp");
const { encrypt, decrypt } = require("../../essentials/cryptography");
const VerifyUser = require("../VerifyUser.js");
const Stripe = require("stripe");
const {
  TermsAndConditionsClient,
  TermsAndConditionsCoach,
  TermsAndConditionsAd,
  TermsAndConditionsShop,
} = require("../../Database/app/TermsAndConditions");
const Country = require("../../Database/app/CountrySchema.js");
const PrivacyPolicy = require("../../Database/app/PrivacyPolicy.js");
const multer = require("multer");
const path = require("path");
const Coaches = require("../../Database/coach/coachSchema");
const CoachUnverified = require("../../Database/coach/coachUnverified.js");
const CoachUnverified2 = require("../../Database/coach/coachUnverified2.js");

const twilio = require("twilio");
const accountSid = "ACc86102fc09260ed1cc341237ddfa2aeb";
const authToken = "59a90ca1dcaf5d17b51e54efd728bb46";
const verifySid = "VA4a0b9a2e84100362aaf4781ec8faf191";
const client = twilio(accountSid, authToken);
const stripe = Stripe(
  "sk_test_51QUpeKAgw3asoEkc2ztjTMUoVGkqov2j1d7YVmrFJtSipO6gzpFaiVYEx5ZHvph70uG49DimsWprRd38hRHEEdju00IGQpnFEF"
);

let terms_client = [];
let terms_coach = [];
let terms_ad = [];
let terms_shop = [];

// getting terms client
async function get_terms_client() {
  console.log("starting client");
  await TermsAndConditionsClient.findOne({
    id: "id_for_termsandconditions",
  }).then(async (all_tandc) => {
    terms_client = [];
    all_tandc.termsAndConditions.map((item) => {
      terms_client.push({
        id: item.id,
        type: item.type,
        content: decrypt(item.content),
      });
    });
  });
  console.log("client terms done");
}
// getting terms coach
async function get_terms_coach() {
  console.log("starting coach");
  await TermsAndConditionsCoach.findOne({
    id: "id_for_termsandconditions",
  }).then(async (all_tandc) => {
    terms_coach = [];
    all_tandc.termsAndConditions.map((item) => {
      terms_coach.push({
        id: item.id,
        type: item.type,
        content: decrypt(item.content),
      });
    });
  });
  console.log("coach terms done");
}
// getting terms ad
async function get_terms_ad() {
  console.log("starting ad");
  await TermsAndConditionsAd.findOne({ id: "id_for_termsandconditions" }).then(
    async (all_tandc) => {
      terms_ad = [];
      all_tandc.termsAndConditions.map((item) => {
        terms_ad.push({
          id: item.id,
          type: item.type,
          content: decrypt(item.content),
        });
      });
    }
  );

  console.log("ads terms done");
}
// getting terms shop
async function get_terms_shop() {
  console.log("starting shop");
  await TermsAndConditionsShop.findOne({
    id: "id_for_termsandconditions",
  }).then(async (all_tandc) => {
    terms_shop = [];
    all_tandc.termsAndConditions.map((item) => {
      terms_shop.push({
        id: item.id,
        type: item.type,
        content: decrypt(item.content),
      });
    });
  });

  console.log("shop terms done");
}

// calling
// open it
// get_terms_client().then(() => {
//   get_terms_coach().then(() => {
//     get_terms_ad().then(() => {
//       get_terms_shop();
//     });
//   });
// });

// create a route to update them from dashboard
async function send_otp(phone) {
  console.log(phone);
  await client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phone, channel: "sms" });
}

const treasure_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../treasure/")); // Ensure the correct folder path
  },
  filename: async (req, file, cb) => {
    console.log("we are here guys");
    const new_name = "user_profile_" + getId(12);
    const customName = req.body.filename || "default_name"; // Ensure req.body is parsed
    const fileExtension = path.extname(file.originalname);
    cb(null, `${new_name}${fileExtension}`);

    req.body.file_name = `${new_name}${fileExtension}`;
    console.log(req.body);
  },
});

// this is the signup section
auth.post("/signup", async (req, res) => {
  const { name, contact, password, referal_code, pet_name } = req.body;
  if (enu(name, contact, password)) {
    User.findOne({ mobile: contact })
      .then(async (userData) => {
        if (userData == undefined) {
          let otp = OTP(contact);
          let otpId = getId(12);
          send_otp(contact);
          try {
            const newUser = new User({
              name: encrypt(name),
              // email: email,
              mobile: contact,
              password: encrypt(password),
              // dob: new Date(dob),
              // country: country,
              // gender: gender,
              otp: encrypt(otp),
              otpId: otpId,
              pet_name: encrypt(pet_name),
              referal_code: encrypt(referal_code),
              // token: encrypt(newId),
            });

            await newUser.save();
            res.send({
              res: true,
              otpId: encrypt(otpId),
            });
          } catch (error) {
            const newError = new Error({
              name: "user signup error",
              file: "users/auth.js",
              description:
                "was not able to insert data into database + " + error,
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

// this is the otp section
auth.post("/otp", async (req, res) => {
  const { otp, otpId } = req.body;
  User.findOne({
    otpId: decrypt(otpId),
  }).then(async (userData) => {
    if (userData == undefined) {
      res.send({
        res: false,
        alert: "Unauthorized route",
        redirect: "login",
      });
    } else {
      // if (decrypt(userData.otp) == otp || otp == "12345") {
      //   let newToken = getId(12);
      //   User.updateOne(
      //     { _id: userData._id },
      //     {
      //       $set: {
      //         token: newToken,
      //         mobileVerified: true,
      //       },
      //     }
      //   )
      //     .then((result) => {
      //       res.send({ res: true, token: encrypt(newToken) });
      //     })
      //     .catch(async (err) => {
      //       const newError = new Error({
      //         name: "user signup error",
      //         file: "users/auth.js",
      //         description: "was not able to put token+ " + err,
      //         dateTime: new Date(),
      //         section: "users",
      //         priority: "medium",
      //       });
      //       await newError.save();
      //       res.send({
      //         res: false,
      //         alert: "Something went wrong, please restart the app",
      //       });
      //     });
      // } else {
      //   res.send({
      //     res: true,
      //     alert: "Incorrect OTP",
      //   });
      // }

      const verificationCheck = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: userData.mobile, code: otp });

      if (verificationCheck.status == "approved") {
        let newToken = getId(12);
        User.updateOne(
          { _id: userData._id },
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
              name: "user signup error",
              file: "users/auth.js",
              description: "was not able to put token+ " + err,
              dateTime: new Date(),
              section: "users",
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

// this is the login section for the user
auth.post("/login", (req, res) => {
  console.log(req.body);
  // will see it after some time
  if (enu(req.body.contact, req.body.password)) {
    User.findOne({ mobile: req.body.contact })
      .then((userData) => {
        if (userData != undefined) {
          if (decrypt(userData.password) == req.body.password) {
            let newToken = getId(12);
            User.updateOne({ _id: userData._id }, { $set: { token: newToken } })
              .then((result) => {
                res.send({
                  server: true,
                  res: true,
                  supply: encrypt(newToken),
                });
              })
              .catch((err) => {
                const newError = new Error({
                  name: "user login error",
                  file: "users/auth.js",
                  description: "was not able to put token+ " + err,
                  dateTime: new Date(),
                  section: "users",
                  priority: "medium",
                });
                newError.save();
                res.send({
                  server: true,
                  res: false,
                  alert: "Something went wrong, please restart the app",
                });
              });
          } else {
            res.send({
              server: true,
              res: false,
              alert: "Contact number or password is incorrect",
            });
          }
        } else {
          res.send({
            server: true,
            res: false,
            alert: "Contact number or password is incorrect",
          });
        }
      })
      .catch((err) => {
        res.send({
          server: true,
          res: false,
          alert: "contact or password is incorrect",
        });
      });
  } else {
    res.send({ server: true, res: false, alert: "Please fill all the fields" });
  }
});

// auth.post("/login-coach", (req, res) => {
//   console.log(req.body);
//   // will see it after some time
//   if (enu(req.body.contact, req.body.password)) {
//     User.findOne({ mobile: req.body.contact })
//       .then((userData) => {
//         if (userData != undefined) {
//           if (decrypt(userData.password) == req.body.password) {
//             let newToken = getId(12);
//             User.updateOne({ _id: userData._id }, { $set: { token: newToken } })
//               .then((result) => {
//                 res.send({
//                   server: true,
//                   res: true,
//                   supply: encrypt(newToken),
//                 });
//               })
//               .catch((err) => {
//                 const newError = new Error({
//                   name: "user login error",
//                   file: "users/auth.js",
//                   description: "was not able to put token+ " + err,
//                   dateTime: new Date(),
//                   section: "users",
//                   priority: "medium",
//                 });
//                 newError.save();
//                 res.send({
//                   server: true,
//                   res: false,
//                   alert: "Something went wrong, please restart the app",
//                 });
//               });
//           } else {
//             res.send({
//               server: true,
//               res: false,
//               alert: "Contact number or password is incorrect",
//             });
//           }
//         } else {
//           res.send({
//             server: true,
//             res: false,
//             alert: "Contact number or password is incorrect",
//           });
//         }
//       })
//       .catch((err) => {
//         res.send({
//           server: true,
//           res: false,
//           alert: "contact or password is incorrect",
//         });
//       });
//   } else {
//     res.send({ server: true, res: false, alert: "Please fill all the fields" });
//   }
// });

auth.post("/login-coach", async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.send({
        server: true,
        res: false,
        alert: "Please fill all the fields",
      });
    }

    // Helper function to attempt login in a given collection
    const tryLogin = async (Model, supply = null) => {
      const userData = await Model.findOne({ mobile: contact }).lean();
      if (!userData) return null;

      if (decrypt(userData.password) === password) {
        const newToken = getId(64); // generate a secure token
        await Model.updateOne(
          { _id: userData._id },
          { $set: { token: newToken } }
        );

        return {
          server: true,
          res: supply ? false : true,
          supply: supply || undefined,
          token: encrypt(newToken),
        };
      }

      return {
        server: true,
        res: false,
        alert: "Contact or password is incorrect",
      };
    };

    // Query 1: Coaches (fully verified)
    let result = await tryLogin(Coaches);
    if (result) return res.send(result);

    // Query 2: CoachUnverified (half verified)
    result = await tryLogin(CoachUnverified, "1");
    if (result) return res.send(result);

    // Query 3: CoachUnverified2 (unverified)
    result = await tryLogin(CoachUnverified2, "2");
    if (result) return res.send(result);

    // If no match found
    return res.send({
      server: true,
      res: false,
      alert: "Contact number or password is incorrect",
    });
  } catch (err) {
    console.error("Error in /login-coach:", err);
    return res.status(500).send({
      server: false,
      res: false,
      alert: "Something went wrong, please try again later",
    });
  }
});

auth.post("/login-event", (req, res) => {
  console.log(req.body);
  // will see it after some time
  if (enu(req.body.contact, req.body.password)) {
    Ad.findOne({ mobile: req.body.contact })
      .then((userData) => {
        if (userData != undefined) {
          if (decrypt(userData.password) == req.body.password) {
            let newToken = getId(12);
            Ad.updateOne({ _id: userData._id }, { $set: { token: newToken } })
              .then((result) => {
                res.send({
                  server: true,
                  res: true,
                  supply: encrypt(newToken),
                });
              })
              .catch((err) => {
                const newError = new Error({
                  name: "user login error",
                  file: "users/auth.js",
                  description: "was not able to put token+ " + err,
                  dateTime: new Date(),
                  section: "users",
                  priority: "medium",
                });
                newError.save();
                res.send({
                  server: true,
                  res: false,
                  alert: "Something went wrong, please restart the app",
                });
              });
          } else {
            res.send({
              server: true,
              res: false,
              alert: "Contact number or password is incorrect",
            });
          }
        } else {
          res.send({
            server: true,
            res: false,
            alert: "Contact number or password is incorrect",
          });
        }
      })
      .catch((err) => {
        res.send({
          server: true,
          res: false,
          alert: "contact or password is incorrect",
        });
      });
  } else {
    res.send({ server: true, res: false, alert: "Please fill all the fields" });
  }
});

auth.post("/login-product", (req, res) => {
  console.log(req.body);
  // will see it after some time
  if (enu(req.body.contact, req.body.password)) {
    Product.findOne({ mobile: req.body.contact })
      .then((userData) => {
        if (userData != undefined) {
          if (decrypt(userData.password) == req.body.password) {
            let newToken = getId(12);
            Product.updateOne(
              { _id: userData._id },
              { $set: { token: newToken } }
            )
              .then((result) => {
                res.send({
                  server: true,
                  res: true,
                  supply: encrypt(newToken),
                });
              })
              .catch((err) => {
                const newError = new Error({
                  name: "user login error",
                  file: "users/auth.js",
                  description: "was not able to put token+ " + err,
                  dateTime: new Date(),
                  section: "users",
                  priority: "medium",
                });
                newError.save();
                res.send({
                  server: true,
                  res: false,
                  alert: "Something went wrong, please restart the app",
                });
              });
          } else {
            res.send({
              server: true,
              res: false,
              alert: "Contact number or password is incorrect",
            });
          }
        } else {
          res.send({
            server: true,
            res: false,
            alert: "Contact number or password is incorrect",
          });
        }
      })
      .catch((err) => {
        res.send({
          server: true,
          res: false,
          alert: "contact or password is incorrect",
        });
      });
  } else {
    res.send({ server: true, res: false, alert: "Please fill all the fields" });
  }
});

// to get the terms and conditions
auth.post("/get-terms-and-condition-depriciated", async (req, res) => {
  console.log(req.body);
  if (req.body.role == "user") {
    await TermsAndConditionsClient.findOne({ id: "id_for_termsandconditions" })
      .then(async (all_tandc) => {
        res.send({
          server: true,
          res: true,
          supply: all_tandc.termsAndConditions.map((item) => {
            return {
              id: item.id,
              type: item.type,
              content: decrypt(item.content),
            };
          }),
        });
      })
      .catch(async () => {
        const newError = new Error({
          name: "when getting terms and condition",
          file: "users/auth.js",
          description:
            "when user was getting the terms and condition + " + error,
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
  } else if (req.body.role == "coach") {
    await TermsAndConditionsCoach.findOne({ id: "id_for_termsandconditions" })
      .then(async (all_tandc) => {
        res.send({
          server: true,
          res: true,
          supply: all_tandc.termsAndConditions.map((item) => {
            return {
              id: item.id,
              type: item.type,
              content: decrypt(item.content),
            };
          }),
        });
      })
      .catch(async () => {
        const newError = new Error({
          name: "when getting terms and condition",
          file: "users/auth.js",
          description:
            "when user was getting the terms and condition + " + error,
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
  } else if (req.body.role == "ad") {
    await TermsAndConditionsAd.findOne({ id: "id_for_termsandconditions" })
      .then(async (all_tandc) => {
        res.send({
          server: true,
          res: true,
          supply: all_tandc.termsAndConditions.map((item) => {
            return {
              id: item.id,
              type: item.type,
              content: decrypt(item.content),
            };
          }),
        });
      })
      .catch(async () => {
        const newError = new Error({
          name: "when getting terms and condition",
          file: "users/auth.js",
          description:
            "when user was getting the terms and condition + " + error,
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
  } else if (req.body.role == "shop") {
    await TermsAndConditionsShop.findOne({ id: "id_for_termsandconditions" })
      .then(async (all_tandc) => {
        res.send({
          server: true,
          res: true,
          supply: all_tandc.termsAndConditions.map((item) => {
            return {
              id: item.id,
              type: item.type,
              content: decrypt(item.content),
            };
          }),
        });
      })
      .catch(async () => {
        const newError = new Error({
          name: "when getting terms and condition",
          file: "users/auth.js",
          description:
            "when user was getting the terms and condition + " + error,
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
  }
});

auth.post("/get-terms-and-condition", (req, res) => {
  console.log(req.body);
  if (req.body.role == "user") {
    res.send({
      server: true,
      res: true,
      supply: terms_client,
    });
  } else if (req.body.role == "coach") {
    res.send({
      server: true,
      res: true,
      supply: terms_coach,
    });
  } else if (req.body.role == "ad") {
    res.send({
      server: true,
      res: true,
      supply: terms_ad,
    });
  } else if (req.body.role == "shop") {
    res.send({
      server: true,
      res: true,
      supply: terms_shop,
    });
  }
});

auth.post("/get-privacy-policy", async (req, res) => {
  await PrivacyPolicy.findOne({ id: "id_for_privacy_policy" }).then(
    async (all_tandc) => {
      res.send({
        server: true,
        res: true,
        supply: all_tandc.privacyPolicy.map((item) => {
          return {
            id: item.id,
            type: item.type,
            content: decrypt(item.content),
          };
        }),
      });
    }
  );
});

auth.post("/get-countries", async (req, res) => {
  await Country.find({})
    .then(async (all_countries) => {
      res.send({
        server: true,
        res: true,
        supply: all_countries,
      });
    })
    .catch(async (error) => {
      const newError = new Error({
        name: "get countries",
        file: "users/auth.js",
        description: "when user was getting the countries + " + error,
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
});

auth.post("/resend-otp", async (req, res) => {
  if (enu(req.body.otpId)) {
    await User.findOne({
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
          await User.findOneAndUpdate({ _id: user._id }, { otp: encrypt(otp) })
            .then(() => {
              res.send({ server: true, res: true });
            })
            .catch(async (err) => {
              const newError = new Error({
                name: "resend error",
                file: "users/auth.js",
                description:
                  "the error occured when the user wanted to resend the otp + " +
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
      })
      .catch(async (err) => {
        const newError = new Error({
          name: "resend error",
          file: "users/auth.js",
          description:
            "the error occured when we were finding a user to resend otp + " +
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

auth.post("/finish-profile", (req, res) => {
  const upload = multer({ storage: treasure_storage }).single("profile_image");
  // console.log(upload);
  upload(req, res, async () => {
    const [day, month, year] = req.body.dob.split("-").map(Number);
    const dob_date = new Date(year, month - 1, day); // Month is 0-based in JS
    await User.findOneAndUpdate(
      { token: decrypt(req.body.token) },
      {
        country: req.body.country,
        email: req.body.email,
        dob: dob_date,
        gender: req.body.gender,
        profilePicture: req.body.file_name,
      }
    )
      .then((result) => {
        res.send({ server: true, res: true });
      })
      .catch(async (err) => {
        const newError = new Error({
          name: "finish-profile",
          file: "users/auth.js",
          description:
            "the error occured when we were finishing the profile + " + err,
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
  });
});

auth.post("/start-3-day-trial", (req, res) => {
  VerifyUser(req.body.token)
    .then((user) => {
      User.findByIdAndUpdate(user._id, {
        app_subscription: {
          mode: "3 day free trial",
          start: new Date(),
          end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Add 2 days
          checked_on: new Date(),
        },
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        alert: "Something went wrong, please reopen the app",
      });
    });
});

auth.post("/subscribed", (req, res) => {
  VerifyUser(req.body.token)
    .then((user) => {
      console.log("suibs");
      User.findByIdAndUpdate(user._id, {
        stripe_customer_id: req.body.customer_id,
        app_subscription: {
          mode: "Annually subscribed",
          start: new Date(),
          end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          checked_on: new Date(),
        },
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        alert: "Something went wrong, please reopen the app",
      });
    });
});

auth.post("/subscribe", async (req, res) => {
  console.log("hey");
  try {
    // const { amount, currency } = req.body;
    const amount = 19900;
    const currency = "aed";

    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      payment_method_types: ["card"], // Include what you need
      // setup_future_usage: "off_session",
    });

    console.log("ok here");
    console.log(customer.id);
    res.send({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey:
        "pk_test_51QUpeKAgw3asoEkcwZXNQBnVDY99IjwwIEzJZAIKw3iu3FaM2vFzlTObWHVhS3JXXhEAmUXIQSS4NovDy9WiXoLB0067DbJvYP",
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e.message });
  }
});

auth.get("*", (req, res) => {
  res.send({
    res: false,
    alert: "You do not have permission to access this.",
  });
});
module.exports = auth;
