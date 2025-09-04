const app = require("express").Router();
const VerifyToken = require("../Auth/VerifyToken");
const Error = require("../../Database/system/error.js");
const enu = require("../../essentials/enu.js");
const getId = require("../../essentials/getId.js");
const {
  TermsAndConditionsClient,
  TermsAndConditionsCoach,
  TermsAndConditionsAd,
  TermsAndConditionsShop,
} = require("../../Database/app/TermsAndConditions");
const {
  GuidelineAwareness,
  GuidelineConnectionClient,
  GuidelineConnectionCoach,
  GuidelineReflection,
  GuidelineJournal,
  GuidelineEvent,
  GuidelineShop,
} = require("../../Database/app/Guidelines.js");
const path = require("path");
const PrivacyPolicy = require("../../Database/app/PrivacyPolicy");
const multer = require("multer");
const Country = require("../../Database/app/CountrySchema.js");
const Languages = require("../../Database/app/Languages.js");
const { encrypt, decrypt } = require("../../essentials/cryptography.js");

const treasure_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../treasure/")); // Ensure the correct folder path
  },
  filename: async (req, file, cb) => {
    const new_name = "country_flag_" + getId(12);
    const customName = req.body.filename || "default_name"; // Ensure req.body is parsed
    const fileExtension = path.extname(file.originalname);
    cb(null, `${new_name}${fileExtension}`);

    req.body.file_name = `${new_name}${fileExtension}`;
    console.log(req.body);
  },
});

// this section contain terms and conditions client
app.post("/get-termsAndConditions-client", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await TermsAndConditionsClient.findOne({
        id: "id_for_termsandconditions",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new TermsAndConditionsClient({
              id: "id_for_termsandconditions",
              termsAndConditions: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.termsAndConditions.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-termsAndConditions-client", (req, res) => {
  console.log(req.body.termsAndConditions);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await TermsAndConditionsClient.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new TermsAndConditionsClient({
            id: "id_for_termsandconditions",
            termsAndConditions: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await TermsAndConditionsClient.updateOne(
            { id: "id_for_termsandconditions" },
            {
              $push: {
                termsAndConditions: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-termsAndConditions-client", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await TermsAndConditionsClient.updateOne(
          { id: "id_for_termsandconditions" },
          {
            $pull: {
              termsAndConditions: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-terms-and-condition-client", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await TermsAndConditionsClient.findOneAndUpdate(
          { id: "id_for_termsandconditions" },
          {
            $set: {
              "termsAndConditions.$[elem].type": req.body.type,
              "termsAndConditions.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

// this section contain terms and conditions coach
app.post("/get-termsAndConditions-coach", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await TermsAndConditionsCoach.findOne({ id: "id_for_termsandconditions" })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new TermsAndConditionsCoach({
              id: "id_for_termsandconditions",
              termsAndConditions: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.termsAndConditions.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-termsAndConditions-coach", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await TermsAndConditionsCoach.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new TermsAndConditionsCoach({
            id: "id_for_termsandconditions",
            termsAndConditions: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await TermsAndConditionsCoach.updateOne(
            { id: "id_for_termsandconditions" },
            {
              $push: {
                termsAndConditions: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-terms-and-condition-coach", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await TermsAndConditionsCoach.findOneAndUpdate(
          { id: "id_for_termsandconditions" },
          {
            $set: {
              "termsAndConditions.$[elem].type": req.body.type,
              "termsAndConditions.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/delete-termsAndConditions-coach", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await TermsAndConditionsCoach.updateOne(
          { id: "id_for_termsandconditions" },
          {
            $pull: {
              termsAndConditions: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

// this section contain terms and conditions ad
app.post("/get-termsAndConditions-ad", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await TermsAndConditionsAd.findOne({ id: "id_for_termsandconditions" })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new TermsAndConditionsAd({
              id: "id_for_termsandconditions",
              termsAndConditions: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.termsAndConditions.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-termsAndConditions-ad", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await TermsAndConditionsAd.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new TermsAndConditionsAd({
            id: "id_for_termsandconditions",
            termsAndConditions: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await TermsAndConditionsAd.updateOne(
            { id: "id_for_termsandconditions" },
            {
              $push: {
                termsAndConditions: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-terms-and-condition-ad", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await TermsAndConditionsAd.findOneAndUpdate(
          { id: "id_for_termsandconditions" },
          {
            $set: {
              "termsAndConditions.$[elem].type": req.body.type,
              "termsAndConditions.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/delete-termsAndConditions-ad", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await TermsAndConditionsAd.updateOne(
          { id: "id_for_termsandconditions" },
          {
            $pull: {
              termsAndConditions: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

// this section contain terms and conditions shop
app.post("/get-termsAndConditions-shop", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await TermsAndConditionsShop.findOne({ id: "id_for_termsandconditions" })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new TermsAndConditionsShop({
              id: "id_for_termsandconditions",
              termsAndConditions: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.termsAndConditions.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-termsAndConditions-shop", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await TermsAndConditionsShop.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new TermsAndConditionsShop({
            id: "id_for_termsandconditions",
            termsAndConditions: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await TermsAndConditionsShop.updateOne(
            { id: "id_for_termsandconditions" },
            {
              $push: {
                termsAndConditions: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-terms-and-condition-shop", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await TermsAndConditionsShop.findOneAndUpdate(
          { id: "id_for_termsandconditions" },
          {
            $set: {
              "termsAndConditions.$[elem].type": req.body.type,
              "termsAndConditions.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/delete-termsAndConditions-shop", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await TermsAndConditionsShop.updateOne(
          { id: "id_for_termsandconditions" },
          {
            $pull: {
              termsAndConditions: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

// this section contain privacy policy

app.post("/get-privacy-policy", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await PrivacyPolicy.findOne({ id: "id_for_privacy_policy" })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new PrivacyPolicy({
              id: "id_for_privacy_policy",
              termsAndConditions: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.privacyPolicy.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the privacy policy for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the privacy policy :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-privacy-policy", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await PrivacyPolicy.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new PrivacyPolicy({
            id: "id_for_privacy_policy",
            privacyPolicy: req.body.privacyPolicy,
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await PrivacyPolicy.updateOne(
            { id: "id_for_privacy_policy" },
            { privacyPolicy: req.body.privacyPolicy }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-privacy-policy", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await PrivacyPolicy.findOneAndUpdate(
          { id: "id_for_privacy_policy" },
          {
            $set: {
              "privacyPolicy.$[elem].type": req.body.type,
              "privacyPolicy.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the privacy policy for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/add-privacy-policy", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await PrivacyPolicy.find({}).then(async (result) => {
          if (result.length == 0) {
            const new_q_g = new PrivacyPolicy({
              id: "id_for_privacy_policy",
              privacyPolicy: [
                {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content),
                },
              ],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else {
            await PrivacyPolicy.updateOne(
              { id: "id_for_privacy_policy" },
              {
                $push: {
                  privacyPolicy: {
                    id: req.body.id,
                    type: req.body.type,
                    content: encrypt(req.body.content), // assuming you want to encrypt before saving
                  },
                },
              }
            );
            res.send({ server: true, res: true });
          }
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill the details",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/delete-privacy-policy", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await PrivacyPolicy.updateOne(
          { id: "id_for_privacy_policy" },
          {
            $pull: {
              privacyPolicy: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the policy",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

// this section is for country

app.post("/add-country", async (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      const upload = multer({ storage: treasure_storage }).single(
        "country_flag"
      );
      upload(req, res, async () => {
        let new_country = new Country({
          country: req.body.country_name,
          code: req.body.country_code,
          img: req.body.file_name,
          number_of_digit: req.body.country_no_of_digit,
          currency: req.body.currency,
          app_subscription_ios: req.body.app_ios,
          reflection_subscription_ios: req.body.reflection_ios,
          app_subscription_android: req.body.app_android,
          reflection_subscription_android: req.body.reflection_android,
        });

        await new_country.save();
        res.send({ server: true, res: true });
      });
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-country", async (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      const upload = multer({ storage: treasure_storage }).single(
        "country_flag"
      );
      upload(req, res, async () => {
        await Country.findByIdAndUpdate(req.body.id, {
          country: req.body.country_name,
          code: req.body.country_code,
          img: req.body.file_name,
          number_of_digit: req.body.country_no_of_digit,
        })
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the countries for dashboard :- " +
                err,
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      });
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/get-countries", async (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Country.find({})
        .then((result) => {
          res.send({ server: true, res: true, supply: result });
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the countries for dashboard :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

// this is for language
app.post("/add-language", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.language)) {
        let new_language = new Languages({
          name: encrypt(req.body.language),
        });
        await new_language.save();
        res.send({ server: true, res: true });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid language",
        });
      }
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/get-languages", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      Languages.find({}).then((all_languages) => {
        for (let i = 0; i < all_languages.length; i++) {
          all_languages[i].name = decrypt(all_languages[i].name);
        }

        res.send({ server: true, res: true, supply: all_languages });
      });
    })
    .catch((err) => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-language", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.language)) {
        await Languages.findByIdAndUpdate(req.body.id, {
          name: encrypt(req.body.language),
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid language",
        });
      }
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

// guidelines crud for all
// Awareness section
app.post("/get-guidelines-awareness", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await GuidelineAwareness.findOne({
        id: "id_for_guidelines",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new GuidelineAwareness({
              id: "id_for_guidelines",
              guidelines: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guidelines.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-guidelines-awareness", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await GuidelineAwareness.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new GuidelineAwareness({
            id: "id_for_guidelines",
            guidelines: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await GuidelineAwareness.updateOne(
            { id: "id_for_guidelines" },
            {
              $push: {
                guidelines: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-guidelines-awareness", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await GuidelineAwareness.updateOne(
          { id: "id_for_guidelines" },
          {
            $pull: {
              guidelines: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-guidelines-awareness", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await GuidelineAwareness.findOneAndUpdate(
          { id: "id_for_guidelines" },
          {
            $set: {
              "guidelines.$[elem].type": req.body.type,
              "guidelines.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

// connection client
app.post("/get-guidelines-connection-client", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await GuidelineConnectionClient.findOne({
        id: "id_for_guidelines",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new GuidelineConnectionClient({
              id: "id_for_guidelines",
              guidelines: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guidelines.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-guidelines-connection-client", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await GuidelineConnectionClient.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new GuidelineConnectionClient({
            id: "id_for_guidelines",
            guidelines: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await GuidelineConnectionClient.updateOne(
            { id: "id_for_guidelines" },
            {
              $push: {
                guidelines: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-guidelines-connection-client", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await GuidelineConnectionClient.updateOne(
          { id: "id_for_guidelines" },
          {
            $pull: {
              guidelines: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-guidelines-connection-client", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await GuidelineConnectionClient.findOneAndUpdate(
          { id: "id_for_guidelines" },
          {
            $set: {
              "guidelines.$[elem].type": req.body.type,
              "guidelines.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

//connection coach
app.post("/get-guidelines-connection-coach", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await GuidelineConnectionCoach.findOne({
        id: "id_for_guidelines",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new GuidelineConnectionCoach({
              id: "id_for_guidelines",
              guidelines: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guidelines.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-guidelines-connection-coach", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await GuidelineConnectionCoach.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new GuidelineConnectionCoach({
            id: "id_for_guidelines",
            guidelines: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await GuidelineConnectionCoach.updateOne(
            { id: "id_for_guidelines" },
            {
              $push: {
                guidelines: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-guidelines-connection-coach", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await GuidelineConnectionCoach.updateOne(
          { id: "id_for_guidelines" },
          {
            $pull: {
              guidelines: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-guidelines-connection-coach", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await GuidelineConnectionCoach.findOneAndUpdate(
          { id: "id_for_guidelines" },
          {
            $set: {
              "guidelines.$[elem].type": req.body.type,
              "guidelines.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

// reflection
app.post("/get-guidelines-reflection", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await GuidelineReflection.findOne({
        id: "id_for_guidelines",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new GuidelineReflection({
              id: "id_for_guidelines",
              guidelines: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guidelines.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-guidelines-reflection", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await GuidelineReflection.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new GuidelineReflection({
            id: "id_for_guidelines",
            guidelines: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await GuidelineReflection.updateOne(
            { id: "id_for_guidelines" },
            {
              $push: {
                guidelines: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-guidelines-reflection", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await GuidelineReflection.updateOne(
          { id: "id_for_guidelines" },
          {
            $pull: {
              guidelines: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-guidelines-reflection", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await GuidelineReflection.findOneAndUpdate(
          { id: "id_for_guidelines" },
          {
            $set: {
              "guidelines.$[elem].type": req.body.type,
              "guidelines.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

// journal
app.post("/get-guidelines-journal", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await GuidelineJournal.findOne({
        id: "id_for_guidelines",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new GuidelineJournal({
              id: "id_for_guidelines",
              guidelines: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guidelines.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-guidelines-journal", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await GuidelineJournal.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new GuidelineJournal({
            id: "id_for_guidelines",
            guidelines: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await GuidelineJournal.updateOne(
            { id: "id_for_guidelines" },
            {
              $push: {
                guidelines: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-guidelines-journal", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await GuidelineJournal.updateOne(
          { id: "id_for_guidelines" },
          {
            $pull: {
              guidelines: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-guidelines-journal", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await GuidelineJournal.findOneAndUpdate(
          { id: "id_for_guidelines" },
          {
            $set: {
              "guidelines.$[elem].type": req.body.type,
              "guidelines.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

// events
app.post("/get-guidelines-events", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await GuidelineEvent.findOne({
        id: "id_for_guidelines",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new GuidelineEvent({
              id: "id_for_guidelines",
              guidelines: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guidelines.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-guidelines-events", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await GuidelineEvent.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new GuidelineEvent({
            id: "id_for_guidelines",
            guidelines: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await GuidelineEvent.updateOne(
            { id: "id_for_guidelines" },
            {
              $push: {
                guidelines: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-guidelines-events", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await GuidelineEvent.updateOne(
          { id: "id_for_guidelines" },
          {
            $pull: {
              guidelines: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-guidelines-events", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await GuidelineEvent.findOneAndUpdate(
          { id: "id_for_guidelines" },
          {
            $set: {
              "guidelines.$[elem].type": req.body.type,
              "guidelines.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

// shop
app.post("/get-guidelines-shop", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await GuidelineShop.findOne({
        id: "id_for_guidelines",
      })
        .then(async (all_guidelines) => {
          if (all_guidelines == null) {
            const new_q_g = new GuidelineShop({
              id: "id_for_guidelines",
              guidelines: [],
            });

            await new_q_g.save();
            res.send({ server: true, res: true });
          } else if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guidelines.map((item) => {
                return {
                  id: item.id,
                  type: item.type,
                  content: decrypt(item.content),
                };
              }),
            });
          } else {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying the access the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          }
        })
        .catch((err) => {
          const newError = new Error({
            name: "app",
            file: "admin/app/app.js",
            description:
              "the error occured when the admin was trying the access the terms and condtions :- " +
              err,
            dateTime: new Date(),
            section: "admin",
            priority: "low",
          });
          newError.save();
          res.send({
            server: false,
            res: false,
            alert: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

app.post("/save-guidelines-shop", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await GuidelineShop.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new GuidelineShop({
            id: "id_for_guidelines",
            guidelines: [
              {
                id: req.body.id,
                type: req.body.type,
                content: encrypt(req.body.content),
              },
            ],
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await GuidelineShop.updateOne(
            { id: "id_for_guidelines" },
            {
              $push: {
                guidelines: {
                  id: req.body.id,
                  type: req.body.type,
                  content: encrypt(req.body.content), // assuming you want to encrypt before saving
                },
              },
            }
          );
          res.send({ server: true, res: true });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/delete-guidelines-shop", (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send({
      server: true,
      res: false,
      alert: "ID is required to delete the term.",
    });
  }

  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      try {
        await GuidelineShop.updateOne(
          { id: "id_for_guidelines" },
          {
            $pull: {
              guidelines: { id: id },
            },
          }
        );

        res.send({ server: true, res: true });
      } catch (err) {
        console.error("Error deleting term:", err);
        res.send({
          server: false,
          res: false,
          alert: "Something went wrong while deleting the term.",
        });
      }
    })
    .catch((err) => {
      console.log("Token verification failed:", err);
      res.send({
        server: true,
        res: false,
        redirect: "/login",
      });
    });
});

app.post("/edit-guidelines-shop", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.type, req.body.content)) {
        await GuidelineShop.findOneAndUpdate(
          { id: "id_for_guidelines" },
          {
            $set: {
              "guidelines.$[elem].type": req.body.type,
              "guidelines.$[elem].content": encrypt(req.body.content),
            },
          },
          {
            arrayFilters: [{ "elem.id": req.body.id }],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "app",
              file: "admin/app/app.js",
              description:
                "the error occured when the admin was trying to edit the terms and conditions for app :- ",
              dateTime: new Date(),
              section: "admin",
              priority: "low",
            });
            newError.save();
            res.send({
              server: false,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

module.exports = app;
