const ad = require("express").Router();
const { encrypt, decrypt } = require("../../essentials/cryptography");
const User = require("../../Database/user/userSchema");
const AdsUnverified = require("../../Database/ad/adUnverifiedSchema.js");
const Ads = require("../../Database/ad/adSchema.js");
const VerifyToken = require("../Auth/VerifyToken");
const enu = require("../../essentials/enu.js");
const AdUnverified = require("../../Database/ad/adUnverifiedSchema.js");
const Numbers = require("../../Database/app/Numbers.js");
const EventUnverified = require("../../Database/ad/EventUnverifiedSchema.js");
const Event = require("../../Database/ad/EventSchema.js");

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

ad.post("/get-all-ads", (req, res) => {
  console.log("in get all ads");
  VerifyToken(req.cookies.AuthToken)
    .then(async (r) => {
      let all_users = [];
      await AdsUnverified.find({}).then(async (result) => {
        // console.log(result);
        result.map((indi_user) => {
          if (indi_user.get_verified == true) {
            let iu = {};
            iu.name = decrypt(indi_user.name);
            iu.verified = false;
            iu._id = indi_user._id;
            iu.contact = indi_user.mobile;
            iu.id = indi_user.event_organizer_id;
            all_users.push(iu);
          }
        });
        await Ads.find({}).then((result2) => {
          result2.map((indi_user) => {
            let iu = {};
            iu.name = decrypt(indi_user.name);
            iu.verified = true;
            iu._id = indi_user._id;
            iu.contact = indi_user.mobile;
            iu.id = indi_user.event_organizer_id;
            all_users.push(iu);
          });
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

ad.post("/get-all-events", (req, res) => {
  console.log("in get all events");
  VerifyToken(req.cookies.AuthToken)
    .then(async (r) => {
      let all_users = [];
      await EventUnverified.find({}).then(async (result) => {
        // console.log(result);
        result.map((indi_user) => {
          if (indi_user.get_verified == true) {
            let iu = {};
            iu.name = decrypt(indi_user.event_name);
            iu.verified = false;
            iu._id = indi_user._id;
            // iu.contact = indi_user.mobile;
            iu.id = indi_user.event_id;
            all_users.push(iu);
          }
        });
        await Event.find({}).then((result2) => {
          result2.map((indi_user) => {
            let iu = {};
            iu.name = decrypt(indi_user.event_name);
            iu.verified = true;
            iu._id = indi_user._id;
            // iu.contact = indi_user.mobile;
            iu.id = indi_user.event_id;
            all_users.push(iu);
          });
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

ad.post("/get-indi-ad", (req, res) => {
  console.log("getting indi ad");
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await AdsUnverified.findById(req.body.id).then(async (ad_data) => {
          if (ad_data == null) {
            await Ads.findById(req.body.id).then((ad_data) => {
              if (ad_data == null) {
                res.send({
                  server: true,
                  res: false,
                  alert: "Something went wrong",
                });
              } else {
                let to_send = {};
                to_send.name = decrypt(ad_data.name);
                to_send.mobile = ad_data.mobile;
                to_send.createdAt = ad_data.createdAt;
                to_send.verified = true;
                res.send({ server: true, res: true, supply: to_send });
              }
            });
          } else {
            if (ad_data.get_verified == true) {
              let to_send = {};
              to_send.name = decrypt(ad_data.name);
              to_send.mobile = ad_data.mobile;
              to_send.createdAt = ad_data.createdAt;
              to_send.verified = false;
              res.send({ server: true, res: true, supply: to_send });
            }
          }
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Something went wrong please try again",
        });
      }
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        alert: "You are not authorised to access this information",
      });
    });
});

ad.post("/get-indi-event", (req, res) => {
  console.log("getting indi event");
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await EventUnverified.findById(req.body.id).then(async (ad_data) => {
          if (ad_data == null) {
            await Event.findById(req.body.id).then((ad_data) => {
              if (ad_data == null) {
                res.send({
                  server: true,
                  res: false,
                  alert: "Something went wrong",
                });
              } else {
                let to_send = {};
                to_send.name = decrypt(ad_data.event_name);
                // to_send.mobile = ad_data.mobile;
                to_send.createdAt = ad_data.createdAt;
                to_send.verified = true;
                res.send({ server: true, res: true, supply: to_send });
              }
            });
          } else {
            if (ad_data.get_verified == true) {
              let to_send = {};
              to_send.name = decrypt(ad_data.event_name);
              // to_send.mobile = ad_data.mobile;
              to_send.createdAt = ad_data.createdAt;
              to_send.verified = false;
              res.send({ server: true, res: true, supply: to_send });
            }
          }
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Something went wrong please try again",
        });
      }
    })
    .catch(() => {
      res.send({
        server: true,
        res: false,
        alert: "You are not authorised to access this information",
      });
    });
});

ad.post("/verify-ad", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      AdsUnverified.findById(req.body.id).then(async (ad_un_data) => {
        if (ad_un_data == null) {
          console.log("here");
          console.log(ad_un_data);
          res.send({ server: true, res: false, alert: "Something went wrong" });
        } else {
          const new_ad = new Ads({
            event_organizer_id: await give_me_next_code("eo"),
            name: ad_un_data.name,
            type: ad_un_data.type,
            company_name: ad_un_data.company_name,
            password: ad_un_data.password,
            mobile: ad_un_data.mobile,
            token: ad_un_data.token,
            country: ad_un_data.country,
            verified: true,
          });
          const saved_ad = await new_ad.save();
          increment_code("eo");
          AdUnverified.findByIdAndDelete(req.body.id)
            .then(() => {
              res.send({ server: true, res: true, supply: saved_ad._id });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

ad.post("/verify-event", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      EventUnverified.findById(req.body.id).then(async (ad_un_data) => {
        if (ad_un_data == null) {
          console.log("here");
          console.log(ad_un_data);
          res.send({ server: true, res: false, alert: "Something went wrong" });
        } else {
          const new_ad = new Event({
            event_id: await give_me_next_code("et"),
            advertiser_id: ad_un_data.advertiser_id,
            banner_space: ad_un_data.banner_space,
            creative_pick: ad_un_data.creative_pick,
            event_host: ad_un_data.event_host,
            event_name: ad_un_data.event_name,
            event_banner: ad_un_data.event_banner,
            event_date: ad_un_data.event_date,
            event_time_from: ad_un_data.event_time_from,
            event_type: ad_un_data.event_type,
            event_location: ad_un_data.event_location,
            event_virtual_inperson: ad_un_data.event_virtual_inperson,
            event_time_to: ad_un_data.event_time_to,
            early_bird_final_price: ad_un_data.early_bird_final_price,
            early_bird_discount: ad_un_data.early_bird_discount,
            early_bird_price: ad_un_data.early_bird_price,
            regular_price: ad_un_data.regular_price,
            early_bird_date_to: ad_un_data.early_bird_date_to,
            early_bird_date_from: ad_un_data.early_bird_date_from,
            regular_date_from: ad_un_data.regular_date_from,
            regular_final_price: ad_un_data.regular_final_price,
            regular_discount: ad_un_data.regular_discount,
            rules: ad_un_data.rules,
            description: ad_un_data.description,
            regular_date_to: ad_un_data.regular_date_to,
            licences: ad_un_data.licences,
            daily_charges: ad_un_data.daily_charges,
            special_note: ad_un_data.special_note,
            agreement_terms: ad_un_data.agreement_terms,

            verified: true,
          });
          const saved_ad = await new_ad.save();
          increment_code("eo");
          EventUnverified.findByIdAndDelete(req.body.id)
            .then(() => {
              res.send({ server: true, res: true, supply: saved_ad._id });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

ad.get("/", (req, res) => {
  res.send({ server: true });
});
module.exports = ad;
