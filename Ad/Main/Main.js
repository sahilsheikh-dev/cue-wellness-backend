const main = require("express").Router();
const enu = require("../../essentials/enu");
const getId = require("../../essentials/getId");
const { decrypt, encrypt } = require("../../essentials/cryptography");
const VerifyAd = require("./VerifyAd.js");
const Banner1 = require("../../Database/ad/Banner1Schema.js");
const Banner2 = require("../../Database/ad/Banner2Schema.js");
const EventUnverified = require("../../Database/ad/EventUnverifiedSchema.js");
const Event = require("../../Database/ad/EventSchema.js");
const Country = require("../../Database/app/CountrySchema.js");
const Stripe = require("stripe");
const Numbers = require("../../Database/app/Numbers.js");
const multer = require("multer");
const path = require("path");
const cron = require("node-cron");
const {
  TermsAndConditionsAd,
} = require("../../Database/app/TermsAndConditions");
const axios = require("axios");

const stripe = Stripe(
  "sk_test_51QUpeKAgw3asoEkc2ztjTMUoVGkqov2j1d7YVmrFJtSipO6gzpFaiVYEx5ZHvph70uG49DimsWprRd38hRHEEdju00IGQpnFEF"
);

const stripe2 = Stripe(
  "sk_test_51QUpeKAgw3asoEkc2ztjTMUoVGkqov2j1d7YVmrFJtSipO6gzpFaiVYEx5ZHvph70uG49DimsWprRd38hRHEEdju00IGQpnFEF",
  {
    apiVersion: "2025-06-30.basil",
  }
);
const qs = require("qs");

const treasure_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../treasure/")); // Ensure the correct folder path
  },
  filename: async (req, file, cb) => {
    console.log("we are here guys");
    const new_name = "event_" + getId(12);
    const customName = req.body.filename || "default_name"; // Ensure req.body is parsed
    const fileExtension = path.extname(file.originalname);
    cb(null, `${new_name}${fileExtension}`);

    req.body.file_name = `${new_name}${fileExtension}`;
    console.log(req.body);
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "treasure/"); // ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "ad_licence_" + getId(12) + path.extname(file.originalname));
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
      case "etuv":
        // this is event unverified
        Numbers.findOne({ name: "individual_event_unverified" }).then(
          (num_data) => {
            let num_string = "";
            if (num_data.number < 10) {
              num_string = "00" + (num_data.number + 1);
            } else if (num_data.number < 100) {
              num_string = "0" + (num_data.number + 1);
            }

            let code = "ETUV-" + num_string + "-" + new Date().getFullYear();
            resolve(code);
          }
        );
        break;
      case "et":
        // this is event verified
        Numbers.findOne({ name: "individual_event" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "ET-" + num_string + "-" + new Date().getFullYear();
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
    case "etuv":
      await Numbers.findOne({ name: "individual_event_unverified" }).then(
        async (num_data) => {
          await Numbers.findByIdAndUpdate(num_data._id, {
            number: num_data.number + 1,
          });
        }
      );
      break;
    case "et":
      await Numbers.findOne({ name: "individual_event" }).then(
        async (num_data) => {
          await Numbers.findByIdAndUpdate(num_data._id, {
            number: num_data.number + 1,
          });
        }
      );
      break;
  }
}

function hasDatePassed(dateStr) {
  // Split the string into parts
  const [day, month, year] = dateStr.split("-").map(Number);

  // Create a Date object (month is 0-indexed in JS)
  const inputDate = new Date(year, month - 1, day);

  // Get today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return inputDate < today;
}

cron.schedule("0 0 * * *", async () => {
  try {
    await Banner1.find({}).then(async (banner_1_data) => {
      if (banner_1_data.length != 0) {
        await Event.findById(banner_1_data[0].event_id).then(
          async (indi_event) => {
            if (hasDatePassed(indi_event.regular_date_to)) {
              await Event.findByIdAndUpdate(banner_1_data[0].event_id, {
                eventOver: true,
              });
              console.log("event over");
            }
          }
        );

        await Banner1.findOneAndDelete({
          event_id: banner_1_data[0].event_id,
        }).then(() => {
          console.log("event over done");
        });
      }
    });

    const banner_2_data = await Banner2.find({});
    await Promise.all(
      banner_2_data.map(async (indi_banner) => {
        await Event.findById(indi_banner.event_id).then(async (indi_event) => {
          if (hasDatePassed(indi_event.regular_date_to)) {
            await Event.findByIdAndUpdate(indi_banner.event_id, {
              eventOver: true,
            });
            console.log("event over");
          }
        });

        await Banner2.findOneAndDelete({ event_id: indi_banner.event_id }).then(
          () => {
            console.log("event over done");
          }
        );
      })
    );
  } catch (err) {
    console.error("Error deleting expired events:", err);
  }
});

main.post("/banner1-live", (req, res) => {
  console.log(req.body);
  VerifyAd(req.body.token)
    .then(() => {
      Banner1.find({}).then((banner_data) => {
        if (banner_data.length == 0) {
          console.log(banner_data);
          // can build a banner 1
          res.send({ server: true, res: true, supply: true });
        } else {
          // can not build banner 1 because their is already an ad running on banner 1
          res.send({ server: true, res: true, supply: false });
        }
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/banner-charge", async (req, res) => {
  // const data = qs.stringify({
  //   to_currency: "gbp",
  //   "from_currencies[]": "eur",
  //   lock_duration: "day",
  // });

  // axios
  //   .post("https://api.stripe.com/v1/fx_quotes", data, {
  //     auth: {
  //       username:
  //         "sk_test_51QUpeKAgw3asoEkc2ztjTMUoVGkqov2j1d7YVmrFJtSipO6gzpFaiVYEx5ZHvph70uG49DimsWprRd38hRHEEdju00IGQpnFEF",
  //       password: "",
  //     },
  //     headers: {
  //       "Stripe-Version": "2025-06-30.basil; fx_quote_preview=v1",
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //   })
  //   .then((response) => {
  //     console.log(response.data);
  //   })
  //   .catch((error) => {
  //     console.error(
  //       "Error:",
  //       error.response ? error.response.data : error.message
  //     );
  //   });

  VerifyAd(req.body.token)
    .then((ad_data) => {
      console.log("hi");
      res.send({
        server: true,
        res: true,
        supply: {
          banner1: ad_data.banner_1_daily_charge,
          banner2: ad_data.banner_2_daily_charge,
        },
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/pay-event", (req, res) => {
  console.log(req.body);
  VerifyAd(req.body.token)
    .then(async () => {
      try {
        // const { amount, currency } = req.body;
        const amount = req.body.amount * 100;
        const currency = "USD";

        const customer = await stripe.customers.create();

        const ephemeralKey = await stripe.ephemeralKeys.create(
          { customer: customer.id },
          { apiVersion: "2022-11-15" }
        );

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          customer: customer.id,
          payment_method_types: ["card"],
        });
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
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/submit-event", upload.array("images", 10), (req, res) => {
  VerifyAd(req.body.token)
    .then(async (ad_info) => {
      let all_certi = [];
      req.files.map((item) => {
        all_certi.push(item.filename);
      });
      console.log(typeof req.body.category);
      let at = JSON.parse(req.body.agreement_term);
      let new_etuv = new EventUnverified({
        event_id: await give_me_next_code("etuv"),
        banner_space: req.body.banner,
        advertiser_id: ad_info._id,
        creative_pick: true,
        event_banner: req.body.creative_pick,
        event_name: encrypt(req.body.event_name),
        event_host: encrypt(req.body.event_host),
        event_type: JSON.parse(req.body.category).map((item) => {
          return item.id;
        }),
        event_date: req.body.event_date,
        event_time_from: req.body.event_time_from,
        event_time_to: req.body.event_time_to,
        event_virtual_inperson: encrypt(req.body.vi),
        event_location: encrypt(req.body.location),
        early_bird_price: req.body.eb_price,
        early_bird_discount: req.body.eb_discount,
        early_bird_final_price:
          req.body.eb_price - (req.body.eb_price * req.body.eb_discount) / 100,
        early_bird_date_from: req.body.eb_from,
        early_bird_date_to: req.body.eb_to,
        regular_price: req.body.r_price,
        regular_discount: req.body.r_discount,
        regular_final_price:
          req.body.r_price - (req.body.r_price * req.body.r_discount) / 100,
        regular_date_from: req.body.r_from,
        regular_date_to: req.body.r_to,
        description: encrypt(req.body.discription),
        rules: req.body.rules.split(",").map((item) => encrypt(item)),
        special_note: encrypt(req.body.special_notes),
        licences: [...all_certi],
        daily_charges: req.body.daily_charge,
        agreement_terms: {
          title: encrypt(req.body.title),
          content: at.map((item) => {
            return {
              type: encrypt(item.type),
              content: encrypt(item.content),
            };
          }),
        },
        get_verified: true,
      });

      await new_etuv.save();
      increment_code("etuv");
      res.send({ server: true, res: true });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/submit-event-no-img", (req, res) => {
  VerifyAd(req.body.token)
    .then(async (ad_info) => {
      let all_certi = [];
      let at = req.body.agreement_term;
      let new_etuv = new EventUnverified({
        event_id: await give_me_next_code("etuv"),
        banner_space: req.body.banner,
        advertiser_id: ad_info._id,
        creative_pick: true,
        event_banner: req.body.creative_pick,
        event_name: encrypt(req.body.event_name),
        event_host: encrypt(req.body.event_host),
        event_type: req.body.category.map((item) => {
          return item.id;
        }),
        event_date: req.body.event_date,
        event_time_from: req.body.event_time_from,
        event_time_to: req.body.event_time_to,
        event_virtual_inperson: encrypt(req.body.vi),
        event_location: encrypt(req.body.location),
        early_bird_price: req.body.eb_price,
        early_bird_discount: req.body.eb_discount,
        early_bird_final_price:
          req.body.eb_price - (req.body.eb_price * req.body.eb_discount) / 100,
        early_bird_date_from: req.body.eb_from,
        early_bird_date_to: req.body.eb_to,
        regular_price: req.body.r_price,
        regular_discount: req.body.r_discount,
        regular_final_price:
          req.body.r_price - (req.body.r_price * req.body.r_discount) / 100,
        regular_date_from: req.body.r_from,
        regular_date_to: req.body.r_to,
        description: encrypt(req.body.discription),
        rules: req.body.rules.map((item) => encrypt(item)),
        special_note: encrypt(req.body.special_notes),
        licences: [...all_certi],
        daily_charges: req.body.daily_charge,
        agreement_terms: {
          title: encrypt(req.body.title),
          content: at.map((item) => {
            return {
              type: encrypt(item.type),
              content: encrypt(item.content),
            };
          }),
        },
        get_verified: true,
      });

      await new_etuv.save();
      increment_code("etuv");
      res.send({ server: true, res: true });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/get-currency", (req, res) => {
  console.log(req.body);
  VerifyAd(req.body.token)
    .then(async (ad_data) => {
      await Country.findById(ad_data.country).then((country_data) => {
        if (country_data != null) {
          res.send({ server: true, res: true, supply: country_data.currency });
        } else {
          res.send({ server: true, res: false, alert: "Something went wrong" });
        }
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-all-events", async (req, res) => {
  VerifyAd(req.body.token)
    .then(async (ad) => {
      console.log(ad);
      await Event.find({ advertiser_id: ad._id }).then(async (events_data) => {
        await EventUnverified.find({ advertiser_id: ad._id }).then(
          (event_un_data) => {
            const modified_unverified = event_un_data.map((doc) => {
              const obj = doc.toObject();
              obj.event_name = decrypt(obj.event_name);
              obj.verified = false;
              return obj;
            });

            const modified_verified = events_data.map((doc) => {
              const obj = doc.toObject();
              obj.event_name = decrypt(obj.event_name);
              obj.verified = true;
              return obj;
            });
            // console.log(events_data);
            console.log(event_un_data[0]);
            res.send({
              server: true,
              res: true,
              supply: [...modified_verified, ...modified_unverified],
            });
          }
        );
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/delete-event", async (req, res) => {
  VerifyAd(req.body.token)
    .then(async (ad) => {
      if (enu(req.body.id)) {
        await Event.findById(req.body.id).then(async (event_data) => {
          if (event_data == null) {
            await EventUnverified.findById(req.body.id).then(
              async (eventun_data) => {
                if (eventun_data == null) {
                  res.send({
                    server: true,
                    res: false,
                    alert: "Something went wrong",
                  });
                } else {
                  await EventUnverified.findByIdAndDelete(req.body.id).then(
                    () => {
                      res.send({ server: true, res: true });
                    }
                  );
                }
              }
            );
          } else {
            await Event.findByIdAndDelete(req.body.id).then(() => {
              res.send({ server: true, res: true });
            });
          }
        });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-name", (req, res) => {
  VerifyAd(req.body.token)
    .then((ad) => {
      if (ad.type == "company") {
        res.send({ server: true, res: true, supply: decrypt(ad.company_name) });
      } else {
        res.send({ server: true, res: true, supply: decrypt(ad.name) });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-terms-and-conditions", (req, res) => {
  VerifyAd(req.body.token).then(async () => {
    await TermsAndConditionsAd.findOne({
      id: "id_for_termsandconditions",
    })
      .then(async (all_tandc) => {
        terms = [];
        all_tandc.termsAndConditions.map((item) => {
          terms.push({
            id: item.id,
            type: item.type,
            content: decrypt(item.content),
          });
        });

        res.send({ server: true, res: true, supply: terms });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

main.post("/get-personal-info", (req, res) => {
  VerifyAd(req.body.token)
    .then(async (ad_info) => {
      await Country.findById(ad_info.country).then((country) => {
        console.log(country);
        res.send({
          server: true,
          res: true,
          supply: {
            event_organizer_id: ad_info.event_organizer_id,
            type: ad_info.type,
            company_name: decrypt(ad_info.company_name),
            name: decrypt(ad_info.name),
            mobile: ad_info.mobile,
            country: country.country,
            country_flag: country.img,
          },
        });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

function calculateEventDurations(
  earlyBirdStart,
  earlyBirdEnd,
  regularStart,
  regularEnd
) {
  const result = {
    earlyBirdDays: null,
    regularDays: null,
  };

  // Helper: Convert "DD-MM-YYYY" to Date object
  const parseDate = (str) => {
    if (!str || typeof str !== "string") return null;
    const [day, month, year] = str.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  // Helper: Get day difference (inclusive)
  const getDayDiff = (startStr, endStr) => {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    if (!start || !end || isNaN(start) || isNaN(end)) return null;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  if (earlyBirdStart !== "" && earlyBirdEnd !== "") {
    result.earlyBirdDays = getDayDiff(earlyBirdStart, earlyBirdEnd);
  }

  if (regularStart !== "" && regularEnd !== "") {
    result.regularDays = getDayDiff(regularStart, regularEnd);
  }

  return result;
}

main.post("/get-pay-info", (req, res) => {
  VerifyAd(req.body.token)
    .then(async () => {
      await Event.findById(req.body.id).then((event) => {
        if (event.banner_space == 1) {
          Banner1.find({}).then((banner_1_info) => {
            console.log(banner_1_info);
            if (banner_1_info.length == 0) {
              let no_days = calculateEventDurations(
                event.early_bird_date_from,
                event.early_bird_date_to,
                event.regular_date_from,
                event.regular_date_to
              );
              if (no_days.earlyBirdDays == null) {
                no_days = no_days.regularDays;
              } else {
                no_days = no_days.earlyBirdDays + no_days.regularDays;
              }
              console.log(no_days);
              res.send({
                server: true,
                res: true,
                supply: event.daily_charges * no_days,
              });
            } else {
              res.send({
                server: true,
                res: false,
                alert:
                  "We can't publish your banner at the moment, as Banner 1 space has already been acquired by someone else.",
              });
            }
          });
        } else {
          let no_days = calculateEventDurations(
            event.early_bird_date_from,
            event.early_bird_date_to,
            event.regular_date_from,
            event.regular_date_to
          );
          if (no_days.earlyBirdDays == null) {
            no_days = no_days.regularDays;
          } else {
            no_days = no_days.earlyBirdDays + no_days.regularDays;
          }
          console.log(no_days);
          res.send({
            server: true,
            res: true,
            supply: event.daily_charges * no_days,
          });
        }
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/event-paid", (req, res) => {
  VerifyAd(req.body.token)
    .then(async () => {
      await Event.findByIdAndUpdate(req.body.id, {
        paid: true,
        live: true,
      }).then(async () => {
        await Event.findById(req.body.id).then(async (event_info) => {
          if (event_info.banner_space == 1) {
            let banner = new Banner1({
              event_id: req.body.id,
            });

            await banner.save();
            res.send({ server: true, res: true });
          } else {
            let banner = new Banner2({
              event_id: req.body.id,
            });

            await banner.save();
            res.send({ server: true, res: true });
          }
        });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/track-event", (req, res) => {
  VerifyAd(req.body.token)
    .then(async () => {
      await Event.findById(req.body.id).then((event_info) => {
        res.send({
          server: true,
          res: true,
          supply: {
            accountView: event_info.account_viewed,
            clicks: event_info.clicks,
            engagement: event_info.engagement,
            bookings: event_info.bookings.length,
          },
        });
      });
    })
    .catch((err) => {
      res.send({ server: true, rs: false, logout: true });
    });
});

module.exports = main;
