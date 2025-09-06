const main = require("express").Router();
const Error = require("../../Database/system/error");
const enu = require("../../essentials/enu");
const getId = require("../../essentials/getId");
const { decrypt, encrypt } = require("../../essentials/cryptography");
const Questionnaire = require("../../Database/questionnaire/questionnaire.js");
const Chat = require("../../Database/chat/ChatSchema.js");
const User = require("../../Database/user/userSchema.js");
const Message = require("../../Database/chat/MessageSchema.js");
const Connection = require("../../Database/connection/Connections.js");
const Languages = require("../../Database/app/Languages.js");
const Reflection = require("../../Database/Reflection/Reflection.js");
const Country = require("../../Database/app/CountrySchema.js");
const VerifyToken = require("../../Admin/Auth/VerifyToken");
const BookingAsk = require("../../Database/coach/BookingAskSchema.js");
const Numbers = require("../../Database/app/Numbers.js");
const VerifyCoach = require("./VerifyCoach");
const VerifyCoach2 = require("./VerifyCoach2");
const VerifyCoachFull = require("./VerifyCoachFull");
const VerifyCoachFull2 = require("./VerifyCoachFull2");
const multer = require("multer");
const path = require("path");
const Coaches = require("../../Database/coach/coachSchema");
const CoachUnverified = require("../../Database/coach/coachUnverified.js");
const CoachUnverified2 = require("../../Database/coach/coachUnverified2.js");

const {
  GuidelineAwareness,
  GuidelineConnectionClient,
  GuidelineReflection,
  GuidelineJournal,
  GuidelineEvent,
  GuidelineShop,
} = require("../../Database/app/Guidelines.js");

function hasThreeMonthsPassed(dateString) {
  console.log(dateString);
  const inputDate = new Date(dateString);
  const today = new Date();

  // Calculate the date 3 months ago from today
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  console.log(inputDate < threeMonthsAgo);

  return inputDate < threeMonthsAgo;
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

const treasure_storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../treasure/")); // Ensure the correct folder path
  },
  filename: async (req, file, cb) => {
    // console.log("we are here guys");
    const new_name = "coach_profile_" + getId(12);
    const customName = req.body.filename1 || "default_name"; // Ensure req.body is parsed
    const fileExtension = path.extname(file.originalname);
    cb(null, `${new_name}${fileExtension}`);

    req.body.file_name1 = `${new_name}${fileExtension}`;
  },
});

const treasure_storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../treasure/")); // Ensure the correct folder path
  },
  filename: async (req, file, cb) => {
    console.log("we are here guys");
    const new_name = "coach_profile_" + getId(12);
    const customName = req.body.filename2 || "default_name"; // Ensure req.body is parsed
    const fileExtension = path.extname(file.originalname);
    cb(null, `${new_name}${fileExtension}`);

    req.body.file_name2 = `${new_name}${fileExtension}`;
  },
});

const treasure_storage3 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../treasure/")); // Ensure the correct folder path
  },
  filename: async (req, file, cb) => {
    console.log("we are here guys");
    const new_name = "coach_profile_" + getId(12);
    const customName = req.body.filename3 || "default_name"; // Ensure req.body is parsed
    const fileExtension = path.extname(file.originalname);
    cb(null, `${new_name}${fileExtension}`);

    req.body.file_name3 = `${new_name}${fileExtension}`;
  },
});

main.post("/get-indi-coach", async (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (r) => {
      if (enu(req.body.id)) {
        await CoachUnverified.findById(req.body.id).then((indi_coaches) => {
          res.send({
            server: true,
            res: true,
            supply: {
              name: decrypt(indi_coaches.name),
              mobile: indi_coaches.mobile,
              verified: indi_coaches.verified,
              address: decrypt(indi_coaches.address),
              // card_holder_name: decrypt(indi_coaches.card_holder_name),
              // card_number: decrypt(indi_coaches.card_number),
              // category: decrypt(indi_coaches.category),
              city: decrypt(indi_coaches.city),
              // coach_share: decrypt(indi_coaches.coach_share),
              // cue_share: decrypt(indi_coaches.cue_share),
              // country: decrypt(indi_coaches.country),
              dob: indi_coaches.dob,
              email: decrypt(indi_coaches.email),
              experience_year: decrypt(indi_coaches.experience_year),
              experience_months: decrypt(indi_coaches.experience_months),
              // expiry_date: decrypt(indi_coaches.expiry_date),
              gender: decrypt(indi_coaches.gender),
              // levelOfExpertise: decrypt(indi_coaches.levelOfExpertise),
              pinCode: decrypt(indi_coaches.pinCode),
            },
          });
        });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch((err) => {
      console.log("going from here");
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/get-verified-coach", async (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (r) => {
      if (enu(req.body.id)) {
        await Coaches.findById(req.body.id).then((indi_coaches) => {
          res.send({
            server: true,
            res: true,
            supply: {
              name: decrypt(indi_coaches.name),
              mobile: indi_coaches.mobile,
              verified: indi_coaches.verified,
              address: decrypt(indi_coaches.address),
              // card_holder_name: decrypt(indi_coaches.card_holder_name),
              // card_number: decrypt(indi_coaches.card_number),
              // category: decrypt(indi_coaches.category),
              city: decrypt(indi_coaches.city),
              // coach_share: decrypt(indi_coaches.coach_share),
              // cue_share: decrypt(indi_coaches.cue_share),
              // country: decrypt(indi_coaches.country),
              dob: indi_coaches.dob,
              email: decrypt(indi_coaches.email),
              experience_year: decrypt(indi_coaches.experience_year),
              experience_months: decrypt(indi_coaches.experience_months),
              // expiry_date: decrypt(indi_coaches.expiry_date),
              gender: decrypt(indi_coaches.gender),
              // levelOfExpertise: decrypt(indi_coaches.levelOfExpertise),
              pinCode: decrypt(indi_coaches.pinCode),
            },
          });
        });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch((err) => {
      console.log("going from here");
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/get-un-verified-coach", async (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (r) => {
      if (enu(req.body.id)) {
        await CoachUnverified.findById(req.body.id).then((indi_coaches) => {
          res.send({
            server: true,
            res: true,
            supply: {
              name: decrypt(indi_coaches.name),
              mobile: indi_coaches.mobile,
              verified: indi_coaches.verified,
              address: decrypt(indi_coaches.address),
              // card_holder_name: decrypt(indi_coaches.card_holder_name),
              // card_number: decrypt(indi_coaches.card_number),
              // category: decrypt(indi_coaches.category),
              city: decrypt(indi_coaches.city),
              // coach_share: decrypt(indi_coaches.coach_share),
              // cue_share: decrypt(indi_coaches.cue_share),
              // country: decrypt(indi_coaches.country),
              dob: indi_coaches.dob,
              email: decrypt(indi_coaches.email),
              experience_year: decrypt(indi_coaches.experience_year),
              experience_months: decrypt(indi_coaches.experience_months),
              // expiry_date: decrypt(indi_coaches.expiry_date),
              gender: decrypt(indi_coaches.gender),
              // levelOfExpertise: decrypt(indi_coaches.levelOfExpertise),
              pinCode: decrypt(indi_coaches.pinCode),
            },
          });
        });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch((err) => {
      console.log("going from here");
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/get-half-verified-coach", async (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (r) => {
      if (enu(req.body.id)) {
        await CoachUnverified2.findById(req.body.id).then((indi_coaches) => {
          res.send({
            server: true,
            res: true,
            supply: {
              name: decrypt(indi_coaches.name),
              mobile: indi_coaches.mobile,
              verified: indi_coaches.verified,
              address: decrypt(indi_coaches.address),
              // card_holder_name: decrypt(indi_coaches.card_holder_name),
              // card_number: decrypt(indi_coaches.card_number),
              // category: decrypt(indi_coaches.category),
              city: decrypt(indi_coaches.city),
              // coach_share: decrypt(indi_coaches.coach_share),
              // cue_share: decrypt(indi_coaches.cue_share),
              // country: decrypt(indi_coaches.country),
              dob: indi_coaches.dob,
              email: decrypt(indi_coaches.email),
              experience_year: decrypt(indi_coaches.experience_year),
              experience_months: decrypt(indi_coaches.experience_months),
              // expiry_date: decrypt(indi_coaches.expiry_date),
              gender: decrypt(indi_coaches.gender),
              // levelOfExpertise: decrypt(indi_coaches.levelOfExpertise),
              pinCode: decrypt(indi_coaches.pinCode),
            },
          });
        });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch((err) => {
      console.log("going from here");
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/verify-coach", (req, res) => {
  VerifyToken(req.cookies.AuthToken).then(() => {
    CoachUnverified.findById(req.body.id).then(async (coachUnverified) => {
      const coachData = coachUnverified.toObject();
      // coachData.coach_id = await give_me_next_code("coach");
      const newCoach = new CoachUnverified2(coachData);
      newCoach.save().then(() => {
        // Optionally delete the original unverified coach
        CoachUnverified.findByIdAndDelete(req.body.id).then(() => {
          // increment_code("coach");
          res.send({ server: true, res: true });
        });
      });
    });
  });
});

main.post("/verify-coach-final", (req, res) => {
  VerifyToken(req.cookies.AuthToken).then(() => {
    CoachUnverified2.findById(req.body.id).then(async (coachUnverified2) => {
      if (!coachUnverified2) {
        return res
          .status(404)
          .send({ server: true, res: false, msg: "Coach not found" });
      }

      const coachData = coachUnverified2.toObject();

      // If you want to assign final coach_id, uncomment and use this:
      // coachData.coach_id = await give_me_next_code("coach");

      const newCoach = new Coaches(coachData);
      newCoach.save().then(() => {
        // delete from intermediate collection
        CoachUnverified2.findByIdAndDelete(req.body.id).then(() => {
          // Optionally increment code for coaches
          // increment_code("coach");
          res.send({ server: true, res: true });
        });
      });
    });
  });
});

main.post("/is-verified", async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    if (!req.body.token) {
      return res
        .status(400)
        .send({ server: false, error: "No token provided" });
    }

    console.log("Received token:", req.body.token);
    const decryptedToken = decrypt(req.body.token);
    console.log("Decrypted token:", decryptedToken);

    // Safety: If decrypt fails
    if (!decryptedToken) {
      return res.status(400).send({ server: false, error: "Invalid token" });
    }

    // Query 1: Coaches
    const coach = await Coaches.findOne({ token: decryptedToken }).lean();
    console.log("Coach result:", coach);
    if (coach) return res.send({ server: true, res: true });

    // Query 2: CoachUnverified
    const cuvData = await CoachUnverified.findOne({
      token: decryptedToken,
    }).lean();
    console.log("CoachUnverified result:", cuvData);
    if (cuvData) return res.send({ server: true, res: false, supply: "1" });

    // Query 3: CoachUnverified2
    const cu2 = await CoachUnverified2.findOne({
      token: decryptedToken,
    }).lean();
    console.log("CoachUnverified2 result:", cu2);
    if (cu2) return res.send({ server: true, res: false, supply: "2" });

    // If no match
    console.log("No match found → logout");
    return res.send({ server: true, res: false, redirect: "logout" });
  } catch (err) {
    console.error("Error in /is-verified:", err);
    return res
      .status(500)
      .send({ server: false, error: "Internal Server Error" });
  }
});

main.post("/save-story", async (req, res) => {
  VerifyCoach2(req.body.token)
    .then(async (id) => {
      if (enu(req.body.story)) {
        console.log(req.body.story);
        await CoachUnverified2.findByIdAndUpdate(id, {
          story: encrypt(req.body.story),
        })
          .then((result) => {
            console.log(result);
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            res.send({
              server: true,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/get-level", async (req, res) => {
  VerifyCoach2(req.body.token)
    .then(async (id) => {
      const indi_coaches = await CoachUnverified2.findOne({
        token: decrypt(req.body.token),
      });

      const categories = await Connection.find({
        _id: { $in: indi_coaches.category.map((item) => item.id) },
      });

      let all_levels = [];
      indi_coaches.category.map((item, index) => {
        obj = {
          level: [...indi_coaches.category[index].levelOfExpertise],
          id: indi_coaches.category[index].id,
          title: (() => {
            for (let i = 0; i < categories.length; i++) {
              if (categories[i]._id == item.id) {
                return decrypt(categories[i].title);
              }
            }
          })(),
        };

        all_levels.push(obj);
      });

      // console.log(all_levels);

      res.send({
        server: true,
        res: true,
        supply: all_levels,
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-coach-info", async (req, res) => {
  VerifyCoach2(req.body.token)
    .then(async () => {
      if (enu(req.body.token)) {
        const indi_coaches = await CoachUnverified2.findOne({
          token: decrypt(req.body.token),
        });
        console.log("we are here");

        const categories = await Connection.find({
          _id: { $in: indi_coaches.category.map((item) => item.id) },
        });

        res.send({
          server: true,
          res: true,
          supply: {
            name: decrypt(indi_coaches.name),
            category: categories.map((cat) => ({
              ...cat,
              title: decrypt(cat.title),
            })), // array of full category documents
            experience_year: decrypt(indi_coaches.experience_year),
            experience_months: decrypt(indi_coaches.experience_months),
          },
        });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch((err) => {
      console.error("err");
      console.error(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/save-pricing-and-slots_", (req, res) => {
  VerifyCoach(req.body.token)
    .then(async (id) => {
      console.log(req.body);
      if (req.body.level.includes("Beginner")) {
        // bvp
        const groupedSlots_bvp = {};
        req.body.bvp_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date);
          const dateKey = formattedDate.toISOString().split("T")[0];
          if (!groupedSlots_bvp[dateKey]) {
            groupedSlots_bvp[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }
          groupedSlots_bvp[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_bvp = Object.values(groupedSlots_bvp);

        // bvg
        const groupedSlots_bvg = {};
        req.body.bvg_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_bvg[dateKey]) {
            groupedSlots_bvg[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_bvg[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_bvg = Object.values(groupedSlots_bvg);

        // bip
        const groupedSlots_bip = {};
        req.body.bip_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_bip[dateKey]) {
            groupedSlots_bip[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_bip[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_bip = Object.values(groupedSlots_bip);

        // big
        const groupedSlots_big = {};
        req.body.big_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_big[dateKey]) {
            groupedSlots_big[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_big[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_big = Object.values(groupedSlots_big);

        await Coaches.findByIdAndUpdate(id, {
          beginner_virtual_private_session: {
            avg_time: req.body.bvp_avg_time,
            avg_price: req.body.bvp_avg_price,
            slots: formattedSlots_bvp,
          },
          beginner_virtual_group_session: {
            avg_time: req.body.bvg_avg_time,
            avg_price: req.body.bvg_avg_price,
            slots: formattedSlots_bvg,
          },
          beginner_inperson_private_session: {
            avg_time: req.body.bip_avg_time,
            avg_price: req.body.bip_avg_price,
            slots: formattedSlots_bip,
          },
          beginner_inperson_group_session: {
            avg_time: req.body.big_avg_time,
            avg_price: req.body.big_avg_price,
            slots: formattedSlots_big,
          },
        })
          .then(() => {
            if (
              req.body.level.includes("Intermediate") ||
              req.body.level.includes("Advanced")
            ) {
            } else {
              res.send({ server: true, res: true });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
      if (req.body.level.includes("Intermediate")) {
        // ivp
        const groupedSlots_ivp = {};
        req.body.ivp_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_ivp[dateKey]) {
            groupedSlots_ivp[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_ivp[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_ivp = Object.values(groupedSlots_ivp);

        // ivg
        const groupedSlots_ivg = {};
        req.body.ivg_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_ivg[dateKey]) {
            groupedSlots_ivg[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_ivg[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_ivg = Object.values(groupedSlots_ivg);
        // iip
        const groupedSlots_iip = {};
        req.body.iip_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_iip[dateKey]) {
            groupedSlots_iip[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_iip[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_iip = Object.values(groupedSlots_iip);
        // iig
        const groupedSlots_iig = {};
        req.body.iig_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_iig[dateKey]) {
            groupedSlots_iig[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_iig[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_iig = Object.values(groupedSlots_iig);

        await Coaches.findByIdAndUpdate(id, {
          intermediate_virtual_private_session: {
            avg_time: req.body.ivp_avg_time,
            avg_price: req.body.ivp_avg_price,
            slots: formattedSlots_ivp,
          },
          intermediate_virtual_group_session: {
            avg_time: req.body.ivg_avg_time,
            avg_price: req.body.ivg_avg_price,
            slots: formattedSlots_ivg,
          },
          intermediate_inperson_private_session: {
            avg_time: req.body.iip_avg_time,
            avg_price: req.body.iip_avg_price,
            slots: formattedSlots_iip,
          },
          intermediate_inperson_group_session: {
            avg_time: req.body.iig_avg_time,
            avg_price: req.body.iig_avg_price,
            slots: formattedSlots_iig,
          },
        })
          .then(() => {
            if (req.body.level.includes("Advanced")) {
            } else {
              res.send({ server: true, res: true });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
      if (req.body.level.includes("Advanced")) {
        // avp
        const groupedSlots_avp = {};
        req.body.avp_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_avp[dateKey]) {
            groupedSlots_avp[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_avp[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_avp = Object.values(groupedSlots_avp);

        // avg
        const groupedSlots_avg = {};
        req.body.avg_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_avg[dateKey]) {
            groupedSlots_avg[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_avg[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_avg = Object.values(groupedSlots_avg);

        // aip
        const groupedSlots_aip = {};
        req.body.aip_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_aip[dateKey]) {
            groupedSlots_aip[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_aip[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_aip = Object.values(groupedSlots_aip);

        // aig
        const groupedSlots_aig = {};
        req.body.aig_availability.forEach((slot) => {
          const dateParts = slot.date.split("-");
          const formattedDate = new Date(slot.date); // convert "DD-MM-YYYY" to Date

          const dateKey = formattedDate.toISOString().split("T")[0];

          if (!groupedSlots_aig[dateKey]) {
            groupedSlots_aig[dateKey] = {
              date: formattedDate,
              time: [],
            };
          }

          groupedSlots_aig[dateKey].time.push({
            from: slot.time_from,
            to: slot.time_to,
            booking_status: "false",
            booked: "",
          });
        });
        const formattedSlots_aig = Object.values(groupedSlots_aig);

        await Coaches.findByIdAndUpdate(id, {
          advanced_virtual_private_session: {
            avg_time: req.body.avp_avg_time,
            avg_price: req.body.avp_avg_price,
            slots: formattedSlots_avp,
          },
          advanced_virtual_group_session: {
            avg_time: req.body.avg_avg_time,
            avg_price: req.body.avg_avg_price,
            slots: formattedSlots_avg,
          },
          advanced_inperson_private_session: {
            avg_time: req.body.aip_avg_time,
            avg_price: req.body.aip_avg_price,
            slots: formattedSlots_aip,
          },
          advanced_inperson_group_session: {
            avg_time: req.body.aig_avg_time,
            avg_price: req.body.aig_avg_price,
            slots: formattedSlots_aig,
          },
        })
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

const getSessionFromRaw = (raw) => {
  const sessionMapping = {
    bvp: "beginner_virtual_private_session",
    bvg: "beginner_virtual_group_session",
    bip: "beginner_inperson_private_session",
    big: "beginner_inperson_group_session",
    ivp: "intermediate_virtual_private_session",
    ivg: "intermediate_virtual_group_session",
    iip: "intermediate_inperson_private_session",
    iig: "intermediate_inperson_group_session",
    avp: "advanced_virtual_private_session",
    avg: "advanced_virtual_group_session",
    aip: "advanced_inperson_private_session",
    aig: "advanced_inperson_group_session",
  };

  const session = {};

  for (const shortKey in sessionMapping) {
    const fullKey = sessionMapping[shortKey];
    const value = raw[shortKey];

    session[fullKey] = {
      avg_time: value?.avg_time || "",
      avg_price: value?.avg_price || "",
      currency: value?.currency || "AED", // set default if needed
      slots: Array.isArray(value?.availability)
        ? value.availability.map((slot) => ({
            date: new Date(slot.date),
            time: {
              from: slot.time_from,
              to: slot.time_to,
            },
          }))
        : [],
    };
  }

  return session;
};

main.post("/save-pricing-and-slots", (req, res) => {
  VerifyCoachFull2(req.body.token)
    .then(async (coach) => {
      console.log(req.body.categories[0].bvp.availability.slots);
      console.log(getSessionFromRaw(req.body.categories[0]));
      coach.category = coach.category.map((existingCategory) => {
        const match = req.body.categories.find(
          (incoming) => incoming.id === existingCategory.id
        );

        if (match) {
          return {
            ...existingCategory.toObject(), // ensure it's a plain object if it's a Mongoose doc
            session: getSessionFromRaw(match),
          };
        }

        return existingCategory;
      });

      await coach.save();
      res.send({ server: true, res: true });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/save_agreement", async (req, res) => {
  VerifyCoach(req.body.token)
    .then(async (id) => {
      console.log("here");
      if (enu(req.body.title, req.body.content)) {
        await Coaches.findByIdAndUpdate(id, {
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

main.post("/save-images-1", (req, res) => {
  console.log("img1");
  let file_name1 = "";
  const upload1 = multer({ storage: treasure_storage1 }).single("img1");
  upload1(req, res, async () => {
    file_name1 = req.body.file_name1;

    // console.log(req.body);
    VerifyCoach(req.body.token)
      .then(async (id) => {
        console.log("ID -- ");
        console.log(id);
        await Coaches.findByIdAndUpdate(id, {
          $push: { workImage: { path: file_name1, type: "image" } },
        })
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch(() => {
        res.send({ server: true, res: false, redirect: "/login" });
      });
  });
});

main.post("/save-images-2", (req, res) => {
  // console.log(req.body);
  console.log("img2");
  let file_name1 = "";
  const upload1 = multer({ storage: treasure_storage1 }).single("img2");
  upload1(req, res, async () => {
    file_name1 = req.body.file_name1;

    VerifyCoach(req.body.token)
      .then(async (id) => {
        await Coaches.findByIdAndUpdate(id, {
          $push: { workImage: { path: file_name1, type: "image" } },
        }).then(() => {
          res.send({ server: true, res: true });
        });
      })
      .catch(() => {
        res.send({ server: true, res: false, redirect: "/login" });
      });
  });
});

main.post("/save-video-2", (req, res) => {
  // console.log(req.body);
  console.log("video2");
  let file_name1 = "";
  const upload1 = multer({ storage: treasure_storage1 }).single("img2");
  upload1(req, res, async () => {
    file_name1 = req.body.file_name1;

    VerifyCoach(req.body.token)
      .then(async (id) => {
        await Coaches.findByIdAndUpdate(id, {
          $push: { workImage: { path: file_name1, type: "video" } },
        }).then(() => {
          res.send({ server: true, res: true });
        });
      })
      .catch(() => {
        res.send({ server: true, res: false, redirect: "/login" });
      });
  });
});

main.post("/save-images-3", (req, res) => {
  // console.log(req.body);
  console.log("img3");
  let file_name1 = "";
  const upload1 = multer({ storage: treasure_storage1 }).single("img3");
  upload1(req, res, async () => {
    file_name1 = req.body.file_name1;

    VerifyCoach(req.body.token)
      .then(async (id) => {
        await Coaches.findByIdAndUpdate(id, {
          $push: { workImage: { path: file_name1, type: "video" } },
        }).then(() => {
          res.send({ server: true, res: true });
        });
      })
      .catch(() => {
        res.send({ server: true, res: false, redirect: "/login" });
      });
  });
});

main.post("/save-video-3", (req, res) => {
  // console.log(req.body);
  console.log("video3");
  let file_name1 = "";
  const upload1 = multer({ storage: treasure_storage1 }).single("img3");
  upload1(req, res, async () => {
    file_name1 = req.body.file_name1;

    VerifyCoach(req.body.token)
      .then(async (id) => {
        await Coaches.findByIdAndUpdate(id, {
          $push: { workImage: { path: file_name1, type: "video" } },
        }).then(() => {
          res.send({ server: true, res: true });
        });
      })
      .catch(() => {
        res.send({ server: true, res: false, redirect: "/login" });
      });
  });
});

// main.post("/get-profile", (req, res) => {
//   VerifyCoach(req.body.token)
//     .then(async (id) => {
//       await  Coaches.findById(id).then((coach_data) => {
//         console.log(coach_data);
//         res.send({
//           server: true,
//           res: true,
//           supply: {
//             name: decrypt(coach_data.name),
//             profile: coach_data.workImage[coach_data.workImage.length - 1],
//           },
//         });
//       });
//     })
//     .catch((err) => {
//       res.send({ server: true, res: false, logout: true });
//     });
// });

main.post("/get-all-chats", (req, res) => {
  VerifyCoach(req.body.token)
    .then(async (id) => {
      const all_chat = await Chat.find({ coach_id: id });

      const updated_chat = await Promise.all(
        all_chat.map(async (chat) => {
          const user_data = await User.findById(chat.user_id);
          return {
            ...chat.toObject(), // convert Mongoose doc to plain object
            user_profile: user_data?.profilePicture || null,
            user_name: user_data ? decrypt(user_data.name) : null,
          };
        })
      );
      res.send({ server: true, res: true, supply: updated_chat });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-messages", (req, res) => {
  VerifyCoach(req.body.token)
    .then(() => {
      Message.find({ chat_id: req.body.chat_id }).then((all_chats) => {
        all_chats.sort((a, b) => a.message_number - b.message_number);
        Chat.findOneAndUpdate(
          { chat_id: req.body.chat_id },
          {
            unread: 0,
          }
        ).then(() => {
          res.send({ server: true, res: true, supply: all_chats });
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/send-message", (req, res) => {
  VerifyCoach(req.body.token)
    .then(async (id) => {
      await Chat.findOne({ chat_id: req.body.chat_id }).then(
        async (chat_data) => {
          if (chat_data == undefined) {
          } else {
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "text",
              send_by: "coach",
              content: req.body.message,
              send_at: Date.now(),
              message_number: chat_data.last_message_number + 1,
            });

            await new_message.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: req.body.message,
              last_message_time: Date.now(),
              unread: chat_data.unread + 1,
            });

            res.send({ server: true, res: true });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/get-slot-details", (req, res) => {
  VerifyCoach(req.body.token)
    .then(async (id) => {
      await BookingAsk.findById(req.body.id).then(async (booking_info) => {
        await Coaches.findById(booking_info.coach_id).then((cd) => {
          let new_booking_info = { ...booking_info, coachId: cd.coach_id };
          console.log(booking_info);
          booking_info.coachId = cd.coach_id;
          console.log(booking_info);
          // console.log(new_booking_info);
          // console.log(cd.coach_id);
          res.send({
            server: true,
            res: true,
            supply: [booking_info, cd.coach_id],
          });
        });
      });
    })
    .catch(() => {
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/approve-slots", (req, res) => {
  console.log(req.body.data);
  VerifyCoach(req.body.token)
    .then(async () => {
      await BookingAsk.findByIdAndUpdate(req.body.data._id, {
        slots: req.body.data.slots,
        totalAmount: req.body.ta,
        process_at: "user",
      }).then(async () => {
        const new_message = new Message({
          chat_id: req.body.data.chat_id,
          content_type: "slot_approved",
          send_by: "coach",
          content: req.body.data._id,
          send_at: Date.now(),
          message_number: req.body.data.message_number + 1,
        });

        await new_message.save();

        await Chat.findOneAndUpdate(
          { chat_id: req.body.data.chat_id },
          {
            last_message_number: req.body.data.message_number + 1,
            last_message_text: "slot_approved",
            last_message_time: Date.now(),
            unread: 1,
          }
        );

        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/get-awareness", async (req, res) => {
  console.log("here");
  await Questionnaire.find({ layer: 1 })
    .then((a_data) => {
      a_data.map((item, index) => {
        a_data[index].title = decrypt(item.title);
      });
      res.send({ server: true, res: true, supply: a_data });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-connections", async (req, res) => {
  await Connection.find({ layer: 1 })
    .then((a_data) => {
      a_data.map((item, index) => {
        a_data[index].title = decrypt(item.title);
      });
      res.send({ server: true, res: true, supply: a_data });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-reflection", async (req, res) => {
  await Reflection.find({ layer: 1 })
    .then((a_data) => {
      a_data.map((item, index) => {
        a_data[index].title = decrypt(item.title);
      });
      res.send({ server: true, res: true, supply: a_data });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-category-options", async (req, res) => {
  await Questionnaire.find({ outer_id: req.body.id })
    .then((a_data) => {
      a_data.map((item, index) => {
        a_data[index].title = decrypt(item.title);
      });
      res.send({ server: true, res: true, supply: a_data });
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-category-options-connection", async (req, res) => {
  await Connection.find({ outer_id: req.body.id })
    .then((a_data) => {
      a_data.map((item, index) => {
        a_data[index].title = decrypt(item.title);
      });
      res.send({ server: true, res: true, supply: a_data });
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-category-options-reflection", async (req, res) => {
  await Reflection.find({ outer_id: req.body.id })
    .then((a_data) => {
      a_data.map((item, index) => {
        a_data[index].title = decrypt(item.title);
      });
      console.log(a_data);
      res.send({ server: true, res: true, supply: a_data });
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-awareness-questions", async (req, res) => {
  await Questionnaire.findById(req.body.id)
    .then((a_data) => {
      a_data.questions.map((item, index) => {
        a_data.questions[index].content = decrypt(item.content);
      });
      res.send({ server: true, res: true, supply: a_data.questions });
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/submit-awareness", async (req, res) => {
  await Coaches.findOne({ token: decrypt(req.body.token) }).then(
    async (user) => {
      let new_array = [];
      for (let i = 0; i < req.body.answers.length; i++) {
        let id = Object.keys(req.body.answers[i])[0];
        let marks = Object.values(req.body.answers[i])[0];
        new_array.push({ id: id, value: marks });
      }
      const awarenessEntry = {
        id: req.body.id, // a123 or anything unique
        position: "10", // or any other value
        marks: new_array, // expects array like [{id: 'm1', value: 5}, ...]
      };
      await Coaches.updateOne(
        { _id: user._id },
        {
          $push: {
            awareness: awarenessEntry,
          },
        }
      ).then((result) => {
        res.send({ server: true, res: true });
      });
    }
  );
});

main.post("/did-awareness", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((user) => {
      let not_found = true;
      for (let i = 0; i < user.awareness.length; i++) {
        if (user.awareness[i].id == req.body.id) {
          if (hasThreeMonthsPassed(user.awareness[i].date)) {
            not_found = true;
          } else {
            not_found = false;
          }
        }
      }

      // if(not_found == true){
      res.send({ server: true, res: true, supply: not_found });
      // }
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-meaning", async (req, res) => {
  console.log(req.body.id);
  await Questionnaire.findById(req.body.id)
    .then((result) => {
      result.meaning.map((item, index) => {
        result.meaning[index].content = decrypt(item.content);
      });
      res.send({ server: true, res: true, supply: result.meaning });
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-guide", async (req, res) => {
  await Questionnaire.findById(req.body.id)
    .then((result) => {
      result.guide.map((item, index) => {
        result.guide[index].content = decrypt(item.content);
        result.guide[index].title = decrypt(item.title);
      });
      res.send({ server: true, res: true, supply: result.guide });
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-score-board", async (req, res) => {
  await Coaches.findOne({ token: decrypt(req.body.token) }).then(
    async (user) => {
      res.send({ server: true, res: true, supply: user.awareness });
    }
  );
});

main.post("/get-user-name", async (req, res) => {
  console.log(req.body);
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      console.log(result);
      if (enu(result)) {
        res.send({ server: true, res: true, supply: decrypt(result.name) });
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch((err) => {
      console.log("err -- " + err);
    });
});

main.post("/get-saved-coaches", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      if (enu(user)) {
        res.send({ server: true, res: true, supply: user.saved_coaches });
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/save-coach", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((user) => {
      if (enu(user)) {
        Coaches.findByIdAndUpdate(user._id, {
          $push: {
            saved_coaches: req.body.id,
          },
        })
          .then((result) => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            res.send({
              server: true,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/remove-saved-coach", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((user) => {
      if (enu(user)) {
        Coaches.findByIdAndUpdate(user._id, {
          $pull: {
            saved_coaches: req.body.id,
          },
        })
          .then((result) => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            res.send({
              server: true,
              res: false,
              alert: "Something went wrong",
            });
          });
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/save-journal", (req, res) => {
  VerifyCoachFull(req.body.token).then(async (user) => {
    for (let i = 0; i < req.body.content.length; i++) {
      req.body.content[i].id = getId(12);
    }
    let new_id = getId(12);
    Coaches.findByIdAndUpdate(
      user._id,
      {
        $push: {
          journal: {
            id: new_id,
            type: req.body.type,
            title: req.body.title,
            content: req.body.content,
            date_of_creation: new Date(),
            date_of_last_edit: new Date(),
          },
        },
      },
      {
        new: true,
      }
    )
      .then((result) => {
        for (let i = 0; i < result.journal.length; i++) {
          if (result.journal[i].id == new_id) {
            res.send({ server: true, res: true, supply: result.journal[i] });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.send({ server: true, res: false, alert: "Something went wrong" });
      });
  });
});

main.post("/update-journal", (req, res) => {
  VerifyCoachFull(req.body.token).then(async (user) => {
    req.body.content.forEach((item) => {
      if (!item.id) item.id = getId(12);
    });

    const updated = await Coaches.findOneAndUpdate(
      {
        _id: user._id,
        "journal.id": req.body.id,
      },
      {
        $set: {
          "journal.$.type": req.body.type,
          "journal.$.title": req.body.title,
          "journal.$.content": req.body.content,
          "journal.$.date_of_last_edit": new Date(),
        },
      },
      { new: true }
    );

    const updatedJournal = updated.journal.find((j) => j.id === req.body.id);
    res.send({ server: true, res: true, supply: updatedJournal });
  });
});

main.post("/get-summary-title", (req, res) => {
  VerifyCoachFull(req.body.token).then(async (user) => {
    await Questionnaire.findById(req.body.id).then((result) => {
      res.send({ server: true, res: true, supply: decrypt(result.title) });
    });
  });
});

main.post("/get-coaches", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async () => {
      if (enu(req.body.id)) {
        await Coaches.find({ category: req.body.id }).then(async (result) => {
          let all_coaches = [];
          for (let i = 0; i < result.length; i++) {
            const languageDocs = await Languages.find({
              _id: { $in: result[i].languages },
            });
            let new_obj = {
              languageNames: languageDocs.map((lang) => decrypt(lang.name)),
              name: decrypt(result[i].name),
              id: result[i]._id,
              experience_months: decrypt(result[i].experience_months),
              experience_year: decrypt(result[i].experience_year),
              client_gender: result[i].client_gender.map((item) => {
                return decrypt(item);
              }),
              // languages: result[i].languages,
              levelOfExpertise: result[i].levelOfExpertise.map((item) => {
                return decrypt(item);
              }),
              images: result[i].workImage,
              bvp: {
                price: result[i].beginner_virtual_private_session.avg_price,
                time: result[i].beginner_virtual_private_session.avg_time,
              },
              bvg: {
                price: result[i].beginner_virtual_group_session.avg_price,
                time: result[i].beginner_virtual_group_session.avg_time,
              },
              bip: {
                price: result[i].beginner_inperson_private_session.avg_price,
                time: result[i].beginner_inperson_private_session.avg_time,
              },
              big: {
                price: result[i].beginner_inperson_group_session.avg_price,
                time: result[i].beginner_inperson_group_session.avg_time,
              },
              ivp: {
                price: result[i].intermediate_virtual_private_session.avg_price,
                time: result[i].intermediate_virtual_private_session.avg_time,
              },
              ivg: {
                price: result[i].intermediate_virtual_group_session.avg_price,
                time: result[i].intermediate_virtual_group_session.avg_time,
              },
              iip: {
                price:
                  result[i].intermediate_inperson_private_session.avg_price,
                time: result[i].intermediate_inperson_private_session.avg_time,
              },
              iig: {
                price: result[i].intermediate_inperson_group_session.avg_price,
                time: result[i].intermediate_inperson_group_session.avg_time,
              },
              avp: {
                price: result[i].advanced_virtual_private_session.avg_price,
                time: result[i].advanced_virtual_private_session.avg_time,
              },
              avg: {
                price: result[i].advanced_virtual_group_session.avg_price,
                time: result[i].advanced_virtual_group_session.avg_time,
              },
              aip: {
                price: result[i].advanced_inperson_private_session.avg_price,
                time: result[i].advanced_inperson_private_session.avg_time,
              },
              aig: {
                price: result[i].advanced_inperson_group_session.avg_price,
                time: result[i].advanced_inperson_group_session.avg_time,
              },
              story: decrypt(result[i].story),
            };

            all_coaches.push(new_obj);
          }
          console.log(all_coaches);
          res.send({ server: true, res: true, supply: all_coaches });
        });
      } else {
        res.send({ server: true, res: false, alert: "Something went wrong" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/logout" });
    });
});

main.post("/get-profile", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      console.log("here");
      res.send({
        server: true,
        res: true,
        supply: {
          profile: user.workImage[0],
          name: decrypt(user.name),
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/logout" });
    });
});

main.post("/send-message", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user_data) => {
      await Chat.findOne({ chat_id: user_data._id + req.body.coach_id }).then(
        async (chat_data) => {
          if (chat_data == undefined) {
            console.log("here");
            const new_message = new Message({
              chat_id: user_data._id + req.body.coach_id,
              content_type: "text",
              send_by: "user",
              content: req.body.message,
              send_at: Date.now(),
              message_number: 1,
            });

            const new_chat = new Chat({
              chat_id: user_data._id + req.body.coach_id,
              user_id: user_data._id,
              coach_id: req.body.coach_id,
              last_message_number: 1,
              last_message_text: req.body.message,
              last_message_time: Date.now(),
              unread: 1,
            });

            await new_message.save();
            await new_chat.save();
            res.send({ server: true, res: true });
          } else {
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "text",
              send_by: "user",
              content: req.body.message,
              send_at: Date.now(),
              message_number: chat_data.last_message_number + 1,
            });

            await new_message.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: req.body.message,
              last_message_time: Date.now(),
              unread: chat_data.unread + 1,
            });

            res.send({ server: true, res: true });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/send-vi-ask", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user_data) => {
      await Chat.findOne({ chat_id: user_data._id + req.body.coach_id }).then(
        async (chat_data) => {
          if (chat_data == undefined) {
            console.log("here");
            const new_message = new Message({
              chat_id: user_data._id + req.body.coach_id,
              content_type: "vi_ask",
              send_by: "user",
              content: "asked",
              send_at: Date.now(),
              message_number: 1,
            });

            const new_chat = new Chat({
              chat_id: user_data._id + req.body.coach_id,
              user_id: user_data._id,
              coach_id: req.body.coach_id,
              last_message_number: 1,
              last_message_text: "vi_ask",
              last_message_time: Date.now(),
              unread: 1,
            });

            await new_message.save();
            await new_chat.save();
            res.send({ server: true, res: true });
          } else {
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "vi_ask",
              send_by: "user",
              content: "asked",
              send_at: Date.now(),
              message_number: chat_data.last_message_number + 1,
            });

            await new_message.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: "vi_ask",
              last_message_time: Date.now(),
              unread: chat_data.unread + 1,
            });

            res.send({ server: true, res: true });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/send-pg-ask", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user_data) => {
      await Chat.findOne({ chat_id: user_data._id + req.body.coach_id }).then(
        async (chat_data) => {
          if (chat_data == undefined) {
            console.log("here");
            const new_message = new Message({
              chat_id: user_data._id + req.body.coach_id,
              content_type: "pg_ask",
              send_by: "user",
              content: "asked",
              send_at: Date.now(),
              message_number: 1,
            });

            const new_chat = new Chat({
              chat_id: user_data._id + req.body.coach_id,
              user_id: user_data._id,
              coach_id: req.body.coach_id,
              last_message_number: 1,
              last_message_text: "pg_ask",
              last_message_time: Date.now(),
              unread: 1,
            });

            await new_message.save();
            await new_chat.save();
            res.send({ server: true, res: true });
          } else {
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "pg_ask",
              send_by: "user",
              content: "asked",
              send_at: Date.now(),
              message_number: chat_data.last_message_number + 1,
            });

            await new_message.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: "pg_ask",
              last_message_time: Date.now(),
              unread: chat_data.unread + 1,
            });

            res.send({ server: true, res: true });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/send-vi-answer", (req, res) => {
  console.log(req.body);
  VerifyCoachFull(req.body.token)
    .then(async (user_data) => {
      await Chat.findOne({ chat_id: user_data._id + req.body.coach_id }).then(
        async (chat_data) => {
          console.log(chat_data);
          await Message.findOneAndDelete({
            message_number: chat_data.last_message_number,
            chat_id: chat_data.chat_id,
          }).then(async (result) => {
            console.log(result);
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "vi_answer",
              send_by: "user",
              content: req.body.message,
              send_at: Date.now(),
              message_number: chat_data.last_message_number,
            });

            const new_message2 = new Message({
              chat_id: chat_data.chat_id,
              content_type: "bia_ask",
              send_by: "user",
              content: "asked",
              send_at: Date.now(),
              message_number: chat_data.last_message_number + 1,
            });

            await new_message.save();
            await new_message2.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: "bia_ask",
              last_message_time: Date.now(),
              unread: chat_data.unread + 1,
            });

            res.send({ server: true, res: true });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/send-bia-answer", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user_data) => {
      await Chat.findOne({ chat_id: user_data._id + req.body.coach_id }).then(
        async (chat_data) => {
          await Message.findOneAndDelete({
            message_number: chat_data.last_message_number,
            chat_id: chat_data.chat_id,
          }).then(async (result) => {
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "bia_answer",
              send_by: "user",
              content: req.body.message,
              send_at: Date.now(),
              message_number: chat_data.last_message_number,
            });
            const new_message2 = new Message({
              chat_id: chat_data.chat_id,
              content_type: "pg_ask",
              send_by: "user",
              content: "asked",
              send_at: Date.now(),
              message_number: chat_data.last_message_number + 1,
            });
            await new_message.save();
            await new_message2.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: "pg_ask",
              last_message_time: Date.now(),
              unread: chat_data.unread,
            });

            res.send({ server: true, res: true });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/agree-to-agreement", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user_data) => {
      const new_message = new Message({
        chat_id: user_data._id + req.body.coach_id,
        content_type: "agree_agreement",
        send_by: "user",
        content: "agreed",
        send_at: Date.now(),
        message_number: 1,
      });

      const new_chat = new Chat({
        last_message_number: 1,
        last_message_text: "agree_agreement",
        last_message_time: Date.now(),
        unread: 1,
        coach_id: req.body.coach_id,
        user_id: user_data._id,
        chat_id: user_data._id + req.body.coach_id,
      });
      await new_message.save();

      await new_chat.save();

      res.send({ server: true, res: true });
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/send-pg-answer", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user_data) => {
      await Chat.findOne({ chat_id: user_data._id + req.body.coach_id }).then(
        async (chat_data) => {
          await Message.findOneAndDelete({
            message_number: chat_data.last_message_number,
            chat_id: chat_data.chat_id,
          }).then(async (result) => {
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "pg_answer",
              send_by: "user",
              content: req.body.message,
              send_at: Date.now(),
              message_number: chat_data.last_message_number,
            });
            await new_message.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: "pg_answer",
              last_message_time: Date.now(),
              unread: chat_data.unread,
            });

            res.send({ server: true, res: true });
          });
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/get-messages", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((user) => {
      Message.find({ chat_id: user._id + req.body.coach_id }).then(
        (all_chats) => {
          all_chats.sort((a, b) => a.message_number - b.message_number);
          res.send({ server: true, res: true, supply: all_chats });
        }
      );
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-agreement", (req, res) => {
  console.log(req.body.id);
  VerifyCoachFull(req.body.token)
    .then(async () => {
      await Coaches.findById(req.body.id).then((result) => {
        res.send({
          server: true,
          res: true,
          supply: {
            title: decrypt(result.agreement_terms.title),
            content: result.agreement_terms.content.map((item) => {
              return {
                type: decrypt(item.type),
                content: decrypt(item.content),
              };
            }),
          },
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-slots", (req, res) => {
  console.log("got here");
  console.log(req.body);
  VerifyCoachFull(req.body.token)
    .then(async () => {
      await Coaches.findById(req.body.coach_id).then((coach_data) => {
        console.log(coach_data);
        res.send({
          server: true,
          res: true,
          supply: {
            levelOfExpertise: decrypt(coach_data.levelOfExpertise),
            beginner_virtual_private_session:
              coach_data.beginner_virtual_private_session,
            beginner_virtual_group_session:
              coach_data.beginner_virtual_group_session,
            beginner_inperson_private_session:
              coach_data.beginner_inperson_private_session,
            beginner_inperson_group_session:
              coach_data.beginner_inperson_group_session,
            intermediate_virtual_private_session:
              coach_data.intermediate_virtual_private_session,
            intermediate_virtual_group_session:
              coach_data.intermediate_virtual_group_session,
            intermediate_inperson_private_session:
              coach_data.intermediate_inperson_private_session,
            intermediate_inperson_group_session:
              coach_data.intermediate_inperson_group_session,
            advanced_virtual_private_session:
              coach_data.advanced_virtual_private_session,
            advanced_virtual_group_session:
              coach_data.advanced_virtual_group_session,
            advanced_inperson_private_session:
              coach_data.advanced_inperson_private_session,
            advanced_inperson_group_session:
              coach_data.advanced_inperson_group_session,
          },
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/get-reflection-questions", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      await Reflection.findById(req.body.id).then((result) => {
        res.send({
          server: true,
          res: true,
          supply: result.questions.map((item) => {
            return decrypt(item.content);
          }),
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/get-reflection-guide", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async () => {
      let new_questions = [];
      await Reflection.findById(req.body.id).then((result) => {
        for (let i = 0; i < result.guide.length; i++) {
          let new_obj = {
            title: decrypt(result.guide[i].title),
            content: result.guide[i].content.map((item) => {
              return decrypt(item);
            }),
          };
          new_questions.push(new_obj);
        }
        res.send({ server: true, res: true, supply: new_questions });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/send-slot-request", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      // console.log(req.body);
      const { format, clientLevelTraining, type, slots } = req.body;
      await Coaches.findById(req.body.coach_id).then(async (coach_data) => {
        let price = "";
        if (
          format == "virtual" &&
          clientLevelTraining == "beginner" &&
          type == "private"
        ) {
          price = coach_data.beginner_virtual_private_session.avg_price;
        } else if (
          format == "virtual" &&
          clientLevelTraining == "beginner" &&
          type == "group"
        ) {
          price = coach_data.beginner_virtual_group_session.avg_price;
        } else if (
          format == "in-person" &&
          clientLevelTraining == "beginner" &&
          type == "private"
        ) {
          price = coach_data.beginner_inperson_private_session.avg_price;
        } else if (
          format == "in-person" &&
          clientLevelTraining == "beginner" &&
          type == "group"
        ) {
          price = coach_data.beginner_inperson_group_session.avg_price;
        } else if (
          format == "virtual" &&
          clientLevelTraining == "intermediate" &&
          type == "private"
        ) {
          price = coach_data.intermediate_virtual_private_session.avg_price;
        } else if (
          format == "virtual" &&
          clientLevelTraining == "intermediate" &&
          type == "group"
        ) {
          price = coach_data.intermediate_virtual_group_session.avg_price;
        } else if (
          format == "in-person" &&
          clientLevelTraining == "intermediate" &&
          type == "private"
        ) {
          price = coach_data.intermediate_inperson_private_session.avg_price;
        } else if (
          format == "in-person" &&
          clientLevelTraining == "intermediate" &&
          type == "group"
        ) {
          price = coach_data.intermediate_inperson_group_session.avg_price;
        } else if (
          format == "virtual" &&
          clientLevelTraining == "advanced" &&
          type == "private"
        ) {
          price = coach_data.advanced_virtual_private_session.avg_price;
        } else if (
          format == "virtual" &&
          clientLevelTraining == "advanced" &&
          type == "group"
        ) {
          price = coach_data.advanced_virtual_group_session.avg_price;
        } else if (
          format == "in-person" &&
          clientLevelTraining == "advanced" &&
          type == "private"
        ) {
          price = coach_data.advanced_inperson_private_session.avg_price;
        } else if (
          format == "in-person" &&
          clientLevelTraining == "advanced" &&
          type == "group"
        ) {
          price = coach_data.advanced_inperson_group_session.avg_price;
        }

        for (let i = 0; i < slots.length; i++) {
          slots[i].price = price;
          slots[i].finalPrice = price;
        }
        await Chat.findOne({ chat_id: user._id + req.body.coach_id }).then(
          async (chat_data) => {
            const new_booking_ask = new BookingAsk({
              chat_id: user._id + req.body.coach_id,
              message_number: parseInt(chat_data.last_message_number) + 1,
              coach_id: req.body.coach_id,
              user_id: user._id,
              format: format,
              clientLevelTraining: clientLevelTraining,
              type: type,
              slots: req.body.slots,
              totalAmount: parseInt(price) * parseInt(req.body.slots.length),
              process_at: "coach",
            });

            await new_booking_ask.save();
            const new_message = new Message({
              chat_id: chat_data.chat_id,
              content_type: "slot_request",
              send_by: "user",
              content: new_booking_ask._id,
              send_at: Date.now(),
              message_number: chat_data.last_message_number + 1,
            });

            await new_message.save();

            await Chat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: "slot_request",
              last_message_time: Date.now(),
              unread: chat_data.unread + 1,
            });

            res.send({ server: true, res: true });
          }
        );
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/get-slot-details", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (id) => {
      await BookingAsk.findById(req.body.id).then((booking_info) => {
        res.send({ server: true, res: true, supply: booking_info });
      });
    })
    .catch(() => {
      res.send({ Server: true, res: false, logout: true });
    });
});

// like user like coach
main.post("/get-awareness-guidelines", async (req, res) => {
  await GuidelineAwareness.findOne({ id: "id_for_guidelines" })
    .then(async (all_guidelines) => {
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
    })
    .catch(async () => {
      res.send({
        res: false,
        alert: "Something went wrong, please try again",
      });
    });
});

main.post("/has-read-awareness-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((result) => {
      res.send({
        server: true,
        res: true,
        supply: result.has_read_awareness_guideline,
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/user-has-read-awareness-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      await Coaches.findByIdAndUpdate(result._id, {
        has_read_awareness_guideline: true,
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-connection-guidelines", async (req, res) => {
  await GuidelineConnectionClient.findOne({ id: "id_for_guidelines" })
    .then(async (all_guidelines) => {
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
    })
    .catch(async () => {
      res.send({
        res: false,
        alert: "Something went wrong, please try again",
      });
    });
});

main.post("/get-journal-guidelines", async (req, res) => {
  await GuidelineJournal.findOne({ id: "id_for_guidelines" })
    .then(async (all_guidelines) => {
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
    })
    .catch(async () => {
      res.send({
        res: false,
        alert: "Something went wrong, please try again",
      });
    });
});

main.post("/has-read-connection-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((result) => {
      res.send({
        server: true,
        res: true,
        supply: result.has_read_connection_guideline,
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/user-has-read-connection-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      await Coaches.findByIdAndUpdate(result._id, {
        has_read_connection_guideline: true,
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-reflection-guidelines", async (req, res) => {
  await GuidelineReflection.findOne({ id: "id_for_guidelines" })
    .then(async (all_guidelines) => {
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
    })
    .catch(async () => {
      res.send({
        res: false,
        alert: "Something went wrong, please try again",
      });
    });
});

main.post("/has-read-reflection-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((result) => {
      res.send({
        server: true,
        res: true,
        supply: result.has_read_reflection_guideline,
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/user-has-read-reflection-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      await Coaches.findByIdAndUpdate(result._id, {
        has_read_reflection_guideline: true,
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/has-read-journal-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((result) => {
      res.send({
        server: true,
        res: true,
        supply: result.has_read_journal_guideline,
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/user-has-read-journal-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      await Users.findByIdAndUpdate(result._id, {
        has_read_journal_guideline: true,
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/has-read-events-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((result) => {
      res.send({
        server: true,
        res: true,
        supply: result.has_read_events_guideline,
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/user-has-read-events-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      await Coaches.findByIdAndUpdate(result._id, {
        has_read_events_guideline: true,
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/has-read-shop-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then((result) => {
      res.send({
        server: true,
        res: true,
        supply: result.has_read_shop_guideline,
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/user-has-read-shop-guideline", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      await Coaches.findByIdAndUpdate(result._id, {
        has_read_shop_guideline: true,
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-liked-activities", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      if (enu(user)) {
        res.send({ server: true, res: true, supply: user.liked_activities });
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/like-activity", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      Coaches.findByIdAndUpdate(user._id, {
        $push: {
          liked_activities: req.body.id,
        },
      }).then(() => {
        Coaches.findById(user._id).then((result) => {
          res.send({
            server: true,
            res: true,
            supply: result.liked_activities,
          });
        });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/dislike-activity", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      Coaches.findByIdAndUpdate(user._id, {
        $pull: {
          liked_activities: req.body.id,
        },
      }).then(() => {
        Coaches.findById(user._id).then((result) => {
          res.send({
            server: true,
            res: true,
            supply: result.liked_activities,
          });
        });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-name", async (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (result) => {
      if (enu(result)) {
        res.send({ server: true, res: true, supply: decrypt(result.name) });
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

main.post("/get-personal-info", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      tosend = {};
      tosend.name = decrypt(user.name);
      tosend.email = decrypt(user.email);
      tosend.mobile = user.mobile;
      tosend.mobile = user.mobile;
      tosend.dob = user.dob;
      tosend.gender = decrypt(user.gender);
      tosend.profile = user.workImage[0].path;

      await Country.findById(user.country).then((cd) => {
        tosend.country = cd.country;
        tosend.country_flag = cd.img;
      });

      res.send({ server: true, res: true, supply: tosend });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/saved-coaches", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      if (enu(user)) {
        try {
          // Assuming user.saved_coaches is an array of coach IDs
          const coachDetails = await Coaches.find({
            _id: { $in: user.saved_coaches },
          });
          let tosend = [];
          coachDetails.map((item) => {
            let new_obj = {
              name: decrypt(item.name),
              id: item._id,
              profile: item.workImage[0].path,
            };

            tosend.push(new_obj);
          });
          res.send({ server: true, res: true, supply: tosend });
        } catch (err) {
          console.log(err);
          res.send({ server: true, res: false, error: "Database error" });
        }
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/liked-activities", (req, res) => {
  VerifyCoachFull(req.body.token)
    .then(async (user) => {
      if (enu(user)) {
        try {
          // Assuming user.saved_coaches is an array of coach IDs
          const coachDetails = await Connection.find({
            _id: { $in: user.liked_activities },
          });
          let tosend = [];
          coachDetails.map((item) => {
            let new_obj = {
              name: decrypt(item.title),
              id: item._id,
            };

            tosend.push(new_obj);
          });
          res.send({ server: true, res: true, supply: tosend });
        } catch (err) {
          console.log(err);
          res.send({ server: true, res: false, error: "Database error" });
        }
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});
module.exports = main;
