const main = require("express").Router();
const Questionnaire = require("../../Database/questionnaire/questionnaire");
const Connection = require("../../Database/connection/Connections.js");
const Reflection = require("../../Database/Reflection/Reflection.js");
const Users = require("../../Database/user/userSchema");
const { decrypt } = require("../../essentials/cryptography");
// const Users = require("../../Database/users/users");
const VerifyUser = require("../VerifyUser");
const enu = require("../../essentials/enu");
const getId = require("../../essentials/getId");
const Coach = require("../../Database/coach/coachSchema.js");
const Chat = require("../../Database/chat/ChatSchema.js");
const Message = require("../../Database/chat/MessageSchema.js");
const Languages = require("../../Database/app/Languages.js");
const BookingAsk = require("../../Database/coach/BookingAskSchema.js");
const Country = require("../../Database/app/CountrySchema.js");
const Numbers = require("../../Database/app/Numbers.js");
const ClientManagementChat = require("../../Database/chat/ClientManagementChatSchema.js");
const ClientManagementMessage = require("../../Database/chat/ClientManagementMessageSchema.js");
const Stripe = require("stripe");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Banner1 = require("../../Database/ad/Banner1Schema.js");
const Banner2 = require("../../Database/ad/Banner2Schema.js");
const Event = require("../../Database/ad/EventSchema.js");

const {
  GuidelineAwareness,
  GuidelineConnectionClient,
  GuidelineReflection,
  GuidelineJournal,
  GuidelineEvent,
  GuidelineShop,
} = require("../../Database/app/Guidelines.js");
// const { default: ReflectionGuideline } = require("../../../cue_wellness/Main/User/Reflection/ReflectionGuideline.jsx");

const stripe = Stripe(
  "sk_test_51QUpeKAgw3asoEkc2ztjTMUoVGkqov2j1d7YVmrFJtSipO6gzpFaiVYEx5ZHvph70uG49DimsWprRd38hRHEEdju00IGQpnFEF"
);

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
      case "bill":
        Numbers.findOne({ name: "bill" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "BILL-" + num_string + "-" + new Date().getFullYear();
          resolve(code);
        });
        break;
      case "book":
        Numbers.findOne({ name: "book" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "BOOK-" + num_string + "-" + new Date().getFullYear();
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
    case "bill":
      await Numbers.findOne({ name: "bill" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
    case "book":
      await Numbers.findOne({ name: "book" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
  }
}

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

function get_type_slots_vi(coach) {
  let virtual = false;
  let inperson = false;

  if (
    coach.beginner_virtual_private_session.avg_time != "0" ||
    coach.beginner_virtual_group_session.avg_time != "0" ||
    coach.intermediate_virtual_private_session.avg_time != "0" ||
    coach.intermediate_virtual_group_session.avg_time != "0" ||
    coach.advanced_virtual_private_session.avg_time != "0" ||
    coach.advanced_virtual_group_session.avg_time != "0"
  ) {
    virtual = true;
  }

  if (
    coach.beginner_inperson_private_session.avg_time != "0" ||
    coach.beginner_inperson_group_session.avg_time != "0" ||
    coach.intermediate_inperson_private_session.avg_time != "0" ||
    coach.intermediate_inperson_group_session.avg_time != "0" ||
    coach.advanced_inperson_private_session.avg_time != "0" ||
    coach.advanced_inperson_group_session.avg_time != "0"
  ) {
    inperson = true;
  }

  return { virtual: virtual, inperson: inperson };
}

function get_type_slots_bia(coach, vi) {
  let beginner = false;
  let intermediate = false;
  let advanced = false;
  console.log("vi");
  console.log(vi);

  if (vi == "virtual") {
    if (
      coach.beginner_virtual_group_session.avg_time != "0" ||
      coach.beginner_virtual_private_session.avg_time != "0"
    ) {
      beginner = true;
    }
    if (
      coach.intermediate_virtual_group_session.avg_time != "0" ||
      coach.intermediate_virtual_private_session.avg_time != "0"
    ) {
      intermediate = true;
    }
    if (
      coach.advanced_virtual_group_session.avg_time != "0" ||
      coach.advanced_virtual_private_session.avg_time != "0"
    ) {
      advanced = true;
    }
  }
  if (vi == "in-person") {
    if (
      coach.beginner_inperson_group_session.avg_time != "0" ||
      coach.beginner_inperson_private_session.avg_time != "0"
    ) {
      beginner = true;
    }
    if (
      coach.intermediate_inperson_group_session.avg_time != "0" ||
      coach.intermediate_inperson_private_session.avg_time != "0"
    ) {
      intermediate = true;
    }
    if (
      coach.advanced_inperson_group_session.avg_time != "0" ||
      coach.advanced_inperson_private_session.avg_time != "0"
    ) {
      advanced = true;
    }
  }

  return {
    beginner: beginner,
    intermediate: intermediate,
    advanced: advanced,
  };
}

function get_type_slots_pg(coach, vi, bia) {
  console.log(vi, bia);
  let private = false;
  let group = false;

  if (vi == "virtual" && bia == "beginner") {
    if (coach.beginner_virtual_private_session.avg_time != "0") {
      private = true;
    }
    if (coach.beginner_virtual_group_session.avg_time != "0") {
      group = true;
    }
  }
  if (vi == "virtual" && bia == "intermediate") {
    if (coach.intermediate_virtual_private_session.avg_time != "0") {
      private = true;
    }
    if (coach.intermediate_virtual_group_session.avg_time != "0") {
      group = true;
    }
  }
  if (vi == "virtual" && bia == "advanced") {
    if (coach.advanced_virtual_private_session.avg_time != "0") {
      private = true;
    }
    if (coach.advanced_virtual_group_session.avg_time != "0") {
      group = true;
    }
  }
  if (vi == "in-person" && bia == "beginner") {
    if (coach.beginner_inperson_private_session.avg_time != "0") {
      private = true;
    }
    if (coach.beginner_inperson_group_session.avg_time != "0") {
      group = true;
    }
  }
  if (vi == "in-person" && bia == "intermediate") {
    if (coach.intermediate_inperson_private_session.avg_time != "0") {
      private = true;
    }
    if (coach.intermediate_inperson_group_session.avg_time != "0") {
      group = true;
    }
  }
  if (vi == "in-person" && bia == "advanced") {
    if (coach.advanced_inperson_private_session.avg_time != "0") {
      private = true;
    }
    if (coach.advanced_inperson_group_session.avg_time != "0") {
      group = true;
    }
  }

  return {
    private: private,
    group: group,
  };
}

function get_slots(coach_data, vi, bia, pg) {
  console.log(vi, bia, pg);
  let obj = {};
  obj.levelOfExpertise = decrypt(coach_data.levelOfExpertise);
  if (vi == "virtual" || vi == "both") {
    if (bia == "beginner") {
      if (pg == "private" || pg == "both") {
        obj.vbp = coach_data.beginner_virtual_private_session;
      }
      if (pg == "group" || pg == "both") {
        obj.gbp = coach_data.beginner_virtual_group_session;
      }
    }
    if (bia == "intermediate") {
      if (pg == "private" || pg == "both") {
        obj.vip = coach_data.intermediate_virtual_private_session;
      }
      if (pg == "group" || pg == "both") {
        obj.vig = coach_data.intermediate_virtual_group_session;
      }
    }
    if (bia == "advanced") {
      if (pg == "private" || pg == "both") {
        obj.vap = coach_data.advanced_virtual_private_session;
      }
      if (pg == "group" || pg == "both") {
        obj.vag = coach_data.advanced_virtual_group_session;
      }
    }
  }
  if (vi == "in-person" || vi == "both") {
    if (bia == "beginner") {
      if (pg == "private" || pg == "both") {
        obj.ibp = coach_data.beginner_inperson_private_session;
      }
      if (pg == "group" || pg == "both") {
        obj.ibg = coach_data.beginner_inperson_group_session;
      }
    }
    if (bia == "intermediate") {
      if (pg == "private" || pg == "both") {
        obj.iip = coach_data.intermediate_inperson_private_session;
      }
      if (pg == "group" || pg == "both") {
        obj.iig = coach_data.intermediate_inperson_group_session;
      }
    }
    if (bia == "advanced") {
      if (pg == "private" || pg == "both") {
        obj.iap = coach_data.advanced_inperson_private_session;
      }
      if (pg == "group" || pg == "both") {
        obj.iag = coach_data.advanced_inperson_group_session;
      }
    }
  }

  return obj;
}

main.get("/", (req, res) => {
  res.send("this is the main section for the users");
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
  await Users.findOne({ token: decrypt(req.body.token) }).then(async (user) => {
    let new_array = [];
    for (let i = 0; i < req.body.answers.length; i++) {
      let id = Object.keys(req.body.answers[i])[0];
      let marks = Object.values(req.body.answers[i])[0];
      new_array.push({ id: id, value: marks });
    }
    const awarenessEntry = {
      id: req.body.id, // a123 or anything unique
      position: "10", // or any other value
      main_id: req.body.main_id, // or any other value
      marks: new_array, // expects array like [{id: 'm1', value: 5}, ...]
    };
    await Users.updateOne(
      { _id: user._id },
      {
        $push: {
          awareness: awarenessEntry,
        },
      }
    ).then((result) => {
      res.send({ server: true, res: true });
    });
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
  await Users.findOne({ token: decrypt(req.body.token) }).then(async (user) => {
    let new_awareness = [];
    for (let i = 0; i < user.awareness.length; i++) {
      if (user.awareness[i].main_id == req.body.main_id) {
        new_awareness.push(user.awareness[i]);
      }
    }
    res.send({ server: true, res: true, supply: new_awareness });
  });
});

main.post("/did-awareness", (req, res) => {
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (result) => {
      await Users.findByIdAndUpdate(result._id, {
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (result) => {
      await Users.findByIdAndUpdate(result._id, {
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (result) => {
      await Users.findByIdAndUpdate(result._id, {
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (result) => {
      await Users.findByIdAndUpdate(result._id, {
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (result) => {
      await Users.findByIdAndUpdate(result._id, {
        has_read_shop_guideline: true,
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/get-user-name", async (req, res) => {
  VerifyUser(req.body.token)
    .then(async (result) => {
      if (enu(result)) {
        res.send({ server: true, res: true, supply: decrypt(result.pet_name) });
      } else {
        res.send({ server: true, res: false, logout: true });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

main.post("/get-name", async (req, res) => {
  VerifyUser(req.body.token)
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

main.post("/get-saved-coaches", (req, res) => {
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then((user) => {
      if (enu(user)) {
        Users.findByIdAndUpdate(user._id, {
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
  VerifyUser(req.body.token)
    .then((user) => {
      if (enu(user)) {
        Users.findByIdAndUpdate(user._id, {
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
  VerifyUser(req.body.token).then(async (user) => {
    for (let i = 0; i < req.body.content.length; i++) {
      req.body.content[i].id = getId(12);
    }
    let new_id = getId(12);
    Users.findByIdAndUpdate(
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

// main journal starts here

main.post("/get-journal", (req, res) => {
  VerifyUser(req.body.token)
    .then((user) => {
      console.log(req.body);
      let all_journal = [];
      for (let i = 0; i < user.journal.length; i++) {
        if (
          user.journal[i].type == req.body.type &&
          user.journal[i].content.length != 0
        ) {
          all_journal.push(user.journal[i]);
        }
      }

      res.send({ server: true, res: true, supply: all_journal });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-journal-content", (req, res) => {
  VerifyUser(req.body.token)
    .then((user) => {
      for (let i = 0; i < user.journal.length; i++) {
        if (user.journal[i].id == req.body.id) {
          res.send({ server: true, res: true, supply: user.journal[i] });
          break;
        }
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/save-journal-title", (req, res) => {
  VerifyUser(req.body.token)
    .then((user) => {
      Users.findOneAndUpdate(
        { _id: user._id, "journal.id": req.body.id },
        {
          $set: {
            "journal.$.title": req.body.title, // Update the title of the matched journal
          },
        }
      ).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/save-journal-text", (req, res) => {
  VerifyUser(req.body.token)
    .then(async (user) => {
      const { id, new_id, content } = req.body;

      const foundUser = await Users.findById(user._id);
      if (!foundUser) {
        return res.send({ server: true, res: false, alert: "User not found" });
      }

      // Find the journal with id = new_id
      const journalIndex = foundUser.journal.findIndex((j) => j.id === new_id);
      if (journalIndex === -1) {
        return res.send({
          server: true,
          res: false,
          alert: "Journal not found",
        });
      }

      const journal = foundUser.journal[journalIndex];

      // Check if content with the given `id` exists
      const contentIndex = journal.content.findIndex((c) => c.id === id);

      if (contentIndex !== -1) {
        // Update existing content
        journal.content[contentIndex].content = content;
      } else {
        // Add new content block
        journal.content.push({
          id: id,
          type: "text",
          content: content,
        });
      }

      // Save updated user
      await foundUser.save();

      res.send({ server: true, res: true });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

const uploadDir = path.join(__dirname, "../../treasure/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Generate random ID
// const getId = (len = 12) => {
//   return Math.random()
//     .toString(36)
//     .substring(2, 2 + len);
// };

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // save to /uploads
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // get file extension
    const uniqueName = getId(12) + ext; // e.g., sdakfjlkas.jpg
    cb(null, uniqueName);
  },
});

const upload_journal_image = multer({ storage: storage });

main.post(
  "/save-journal-img",
  upload_journal_image.single("image"),
  async (req, res) => {
    try {
      const user = await VerifyUser(req.body.token);
      const journalId = req.body.journal_id;
      const file = req.file;

      if (!file) {
        return res.send({
          server: true,
          res: false,
          alert: "No file received",
        });
      }

      const imagePath = file.filename;
      const new_id = getId(12); // ID for content block

      const foundUser = await Users.findById(user._id);
      const journalIndex = foundUser.journal.findIndex(
        (j) => j.id === journalId
      );
      if (journalIndex === -1) {
        return res.send({
          server: true,
          res: false,
          alert: "Journal not found",
        });
      }

      foundUser.journal[journalIndex].content.push({
        id: new_id,
        type: "image",
        content: imagePath, // Saved file path
      });

      await foundUser.save();

      res.send({ server: true, res: true, new_id, path: imagePath });
    } catch (err) {
      console.error(err);
      res.send({ server: true, res: false, alert: "Upload failed" });
    }
  }
);

main.post("/delete-journal-img", (req, res) => {
  VerifyUser(req.body.token)
    .then(() => {})
    .catch(() => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

const uploadDir_audio = path.join(__dirname, "../../treasure/");
if (!fs.existsSync(uploadDir_audio)) fs.mkdirSync(uploadDir_audio);

// const getId = (len = 12) => Math.random().toString(36).substr(2, len);

const storage_audio = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir_audio),
  filename: (req, file, cb) => {
    console.log("hey");
    const ext = path.extname(file.originalname); // .mp3, .wav, etc
    const unique = getId(12) + ext;
    cb(null, unique);
  },
});

const upload_audio = multer({ storage: storage_audio });

main.post(
  "/save-journal-audio",
  upload_audio.single("audio"),
  async (req, res) => {
    try {
      const user = await VerifyUser(req.body.token);
      const journalId = req.body.journal_id;
      const file = req.file;

      if (!file)
        return res.send({
          server: true,
          res: false,
          alert: "No audio received",
        });

      const audioPath = file.filename;
      const new_id = getId(12);

      const foundUser = await Users.findById(user._id);
      const journalIndex = foundUser.journal.findIndex(
        (j) => j.id === journalId
      );
      if (journalIndex === -1)
        return res.send({
          server: true,
          res: false,
          alert: "Journal not found",
        });
      console.log(audioPath);

      foundUser.journal[journalIndex].content.push({
        id: new_id,
        type: "audio",
        content: audioPath,
      });

      await foundUser.save();

      res.send({ server: true, res: true, new_id, path: audioPath });
    } catch (err) {
      console.error(err);
      res.send({ server: true, res: false, alert: "Upload failed" });
    }
  }
);

main.post("/delete-journal-audio", (req, res) => {
  VerifyUser(req.body.token)
    .then(() => {})
    .catch(() => {
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/get-new-journal-id", (req, res) => {
  VerifyUser(req.body.token)
    .then(async (user) => {
      let new_id = getId(12);
      await Users.findByIdAndUpdate(user._id, {
        $push: {
          journal: {
            id: new_id,
            type: req.body.type, // required field
            title: "", // optional
            content: [], // required as empty array
            cue: [], // required as empty array
            date_of_creation: new Date(),
            date_of_last_edit: new Date(),
          },
        },
      });
      res.send({ server: true, res: true, supply: new_id });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, alert: "Something went wrong" });
    });
});

main.post("/update-journal", (req, res) => {
  VerifyUser(req.body.token).then(async (user) => {
    req.body.content.forEach((item) => {
      if (!item.id) item.id = getId(12);
    });

    const updated = await Users.findOneAndUpdate(
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

main.post("/save-cue", (req, res) => {
  VerifyUser(req.body.token)
    .then(async (user) => {
      console.log(req.body);
      let main_journal = user.journal.find((item) => item.id == req.body.id);
      console.log(main_journal);
      if (main_journal.cue.some((item) => item.title === req.body.title)) {
        console.log("in if");
        await Users.findOneAndUpdate(
          { _id: user._id, "cue.title": req.body.title },
          {
            $push: {
              "cue.$.content": { id: getId(12), content: req.body.content },
            },
          },
          { new: true }
        );
      } else {
        console.log("in else");
        await Users.findByIdAndUpdate(
          user._id,
          {
            $push: {
              "journal.$[j].cue": {
                title: req.body.title,
                content: [{ id: getId(12), content: req.body.content }],
              },
            },
          },
          {
            arrayFilters: [{ "j.id": req.body.id }],
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

// journal ends here

main.post("/get-summary-title", (req, res) => {
  VerifyUser(req.body.token).then(async (user) => {
    await Questionnaire.findById(req.body.id).then((result) => {
      res.send({ server: true, res: true, supply: decrypt(result.title) });
    });
  });
});

main.post("/get-coaches", (req, res) => {
  VerifyUser(req.body.token)
    .then(async () => {
      if (enu(req.body.id)) {
        await Coach.find({ "category.id": req.body.id }).then(
          async (result) => {
            console.log(result);
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
                // levelOfExpertise: result[i].levelOfExpertise.map((item) => {
                //   return decrypt(item);
                // }),
                images: result[i].workImage,
                category: result[i].category,
                story: decrypt(result[i].story),
              };

              all_coaches.push(new_obj);
            }
            console.log(all_coaches);
            res.send({ server: true, res: true, supply: all_coaches });
          }
        );
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
  VerifyUser(req.body.token)
    .then(async (user) => {
      console.log("here");
      res.send({
        server: true,
        res: true,
        supply: {
          profile: user.profilePicture,
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (user_data) => {
      await Coach.findById(req.body.coach_id).then(async (coach_data) => {
        let obj = get_type_slots_vi(coach_data);
        console.log(obj);
        await Chat.findOne({ chat_id: user_data._id + req.body.coach_id }).then(
          async (chat_data) => {
            if (chat_data == undefined) {
              let vi_string = "";
              if (obj.virtual == true) {
                vi_string += "virtual,";
              }
              if (obj.inperson == true) {
                vi_string += "inperson";
              }
              console.log(vi_string);
              const new_message = new Message({
                chat_id: user_data._id + req.body.coach_id,
                content_type: "vi_ask",
                send_by: "user",
                content: vi_string,
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
              let vi_string = "";
              if (obj.virtual == true) {
                vi_string += "virtual,";
              }
              if (obj.inperson == true) {
                vi_string += "inperson";
              }
              console.log(vi_string);
              const new_message = new Message({
                chat_id: chat_data.chat_id,
                content_type: "vi_ask",
                send_by: "user",
                content: vi_string,
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
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/send-pg-ask", (req, res) => {
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (user_data) => {
      await Coach.findById(req.body.coach_id).then(async (coach_data) => {
        let obj = get_type_slots_bia(coach_data, req.body.message);
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

              let bia_string = "";
              if (obj.beginner == true) {
                bia_string += "beginner,";
              }
              if (obj.intermediate == true) {
                bia_string += "intermediate,";
              }
              if (obj.advanced == true) {
                bia_string += "advanced";
              }
              console.log("bia");
              console.log(bia_string, obj);
              const new_message2 = new Message({
                chat_id: chat_data.chat_id,
                content_type: "bia_ask",
                send_by: "user",
                content: bia_string,
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
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/send-bia-answer", (req, res) => {
  VerifyUser(req.body.token)
    .then(async (user_data) => {
      await Coach.findById(req.body.coach_id).then(async (coach_data) => {
        let obj = get_type_slots_pg(
          coach_data,
          req.body.vi,
          req.body.message.toLowerCase()
        );
        let pg_string = "";
        if (obj.private == true) {
          pg_string += "private,";
        }
        if (obj.group == true) {
          pg_string += "group";
        }
        console.log(obj);
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
                content: pg_string,
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
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/agree-to-agreement", (req, res) => {
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async () => {
      await Coach.findById(req.body.id).then((result) => {
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
  VerifyUser(req.body.token)
    .then(async () => {
      await Coach.findById(req.body.coach_id).then((coach_data) => {
        // console.log(coach_data);
        res.send({
          server: true,
          res: true,
          supply: get_slots(coach_data, req.body.vi, req.body.bia, req.body.pg),
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/get-reflection-questions", (req, res) => {
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (user) => {
      // console.log(req.body);
      const { format, clientLevelTraining, type, slots } = req.body;
      await Coach.findById(req.body.coach_id).then(async (coach_data) => {
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
              booking_id: await give_me_next_code("book"),
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
  VerifyUser(req.body.token)
    .then(async (id) => {
      await BookingAsk.findById(req.body.id).then(async (booking_info) => {
        await Coach.findById(booking_info.coach_id).then((cd) => {
          booking_info.coachId = cd.coach_id;
          console.log(booking_info);
          res.send({ server: true, res: true, supply: booking_info });
        });
      });
    })
    .catch(() => {
      res.send({ Server: true, res: false, logout: true });
    });
});

main.post("/get-liked-activities", (req, res) => {
  VerifyUser(req.body.token)
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
  VerifyUser(req.body.token)
    .then(async (user) => {
      Users.findByIdAndUpdate(user._id, {
        $push: {
          liked_activities: req.body.id,
        },
      }).then(() => {
        Users.findById(user._id).then((result) => {
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
  VerifyUser(req.body.token)
    .then(async (user) => {
      Users.findByIdAndUpdate(user._id, {
        $pull: {
          liked_activities: req.body.id,
        },
      }).then(() => {
        Users.findById(user._id).then((result) => {
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

main.post("/get-personal-info", (req, res) => {
  VerifyUser(req.body.token)
    .then(async (user) => {
      tosend = {};
      tosend.name = decrypt(user.name);
      tosend.email = user.email;
      tosend.mobile = user.mobile;
      tosend.mobile = user.mobile;
      tosend.dob = user.dob;
      tosend.gender = user.gender;
      tosend.profile = user.profilePicture;

      await Country.findById(user.country).then((cd) => {
        tosend.country = cd.country;
        tosend.country_flag = cd.img;
      });

      res.send({ server: true, res: true, supply: tosend });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/saved-coaches", (req, res) => {
  VerifyUser(req.body.token)
    .then(async (user) => {
      if (enu(user)) {
        try {
          // Assuming user.saved_coaches is an array of coach IDs
          const coachDetails = await Coach.find({
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
  VerifyUser(req.body.token)
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

main.post("/subscription-information", (req, res) => {
  VerifyUser(req.body.token)
    .then((user) => {
      res.send({ server: true, res: true, supply: user.app_subscription });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

main.post("/sub-reflection-start", async (req, res) => {
  VerifyUser(req.body.token)
    .then(async () => {
      console.log("in sub reflection start route");
      try {
        // const { amount, currency } = req.body;
        const amount = 4900;
        const currency = "aed";

        const customer = await stripe.customers.create();
        console.log("ok here");

        const ephemeralKey = await stripe.ephemeralKeys.create(
          { customer: customer.id },
          { apiVersion: "2022-11-15" }
        );

        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency,
          customer: customer.id,
          payment_method_types: ["card"], // Include what you need
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

main.post("/sub-reflection", (req, res) => {
  VerifyUser(req.body.token)
    .then((user) => {
      console.log("in sub ref");
      Users.findByIdAndUpdate(user._id, {
        reflection_subscription: {
          mode: "Reflection",
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

main.post("/reflection-already-sub", (req, res) => {
  VerifyUser(req.body.token).then((user) => {
    if (user.reflection_subscription.mode == "Reflection") {
      res.send({ server: true, res: true });
    } else {
      res.send({ server: true, res: false });
    }
  });
});

// management chat starts here
main.post("/management-chat-text", (req, res) => {
  console.log(req.body);
  VerifyUser(req.body.token)
    .then((user) => {
      ClientManagementChat.findOne({ user_id: user._id }).then(
        async (chat_data) => {
          if (chat_data == null) {
            let new_chat_id = getId(12);
            const new_chat = new ClientManagementChat({
              chat_id: new_chat_id,
              user_id: user._id,
              last_message_number: 1,
              // last_message_text:encrypt(req.body.message),
              last_message_text: req.body.message,
              unread_by_user: 1,
              unread_by_management: 1,
            });

            const new_message = new ClientManagementMessage({
              chat_id: new_chat_id,
              content_type: "text",
              send_by: "client",
              content: req.body.message,
              message_number: 1,
              user_id: user._id,
            });

            await new_message.save();
            await new_chat.save();
          } else {
            await ClientManagementChat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: req.body.message,
              unread_by_user: chat_data.unread_by_user + 1,
              unread_by_management: chat_data.unread_by_management + 1,
            });

            const new_message = new ClientManagementMessage({
              chat_id: chat_data.chat_id,
              content_type: "text",
              send_by: "client",
              content: req.body.message,
              message_number: chat_data.last_message_number + 1,
              user_id: user._id,
            });

            await new_message.save();
            res.send({ server: true, res: true });
          }
        }
      );
    })
    .catch(() => {
      res.send({ server: true, res: false, logout: true });
    });
});

const storage_managemenet_chat = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // save to /uploads
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // get file extension
    const uniqueName = "management_chat_img_" + getId(12) + ext; // e.g., sdakfjlkas.jpg
    cb(null, uniqueName);
  },
});

const upload_management_chat_img = multer({
  storage: storage_managemenet_chat,
});

main.post(
  "/management-chat-img",
  upload_management_chat_img.single("image"),
  async (req, res) => {
    try {
      const user = await VerifyUser(req.body.token);
      const file = req.file;

      if (!file) {
        return res.send({
          server: true,
          res: false,
          alert: "No file received",
        });
      }

      const imagePath = file.filename;
      ClientManagementChat.findOne({ user_id: user._id }).then(
        async (chat_data) => {
          if (chat_data == null) {
            let new_chat_id = getId(12);
            const new_chat = new ClientManagementChat({
              chat_id: new_chat_id,
              user_id: user._id,
              last_message_number: 1,
              // last_message_text:encrypt(req.body.message),
              last_message_text: "Image",
              unread_by_user: 1,
              unread_by_management: 1,
            });

            const new_message = new ClientManagementMessage({
              chat_id: new_chat_id,
              content_type: "img",
              send_by: "client",
              content: imagePath,
              message_number: 1,
              user_id: user._id,
            });

            await new_message.save();
            await new_chat.save();
          } else {
            await ClientManagementChat.findByIdAndUpdate(chat_data._id, {
              last_message_number: chat_data.last_message_number + 1,
              last_message_text: "Image",
              unread_by_user: chat_data.unread_by_user + 1,
              unread_by_management: chat_data.unread_by_management + 1,
            });

            const new_message = new ClientManagementMessage({
              chat_id: chat_data.chat_id,
              content_type: "img",
              send_by: "client",
              content: imagePath,
              message_number: chat_data.last_message_number + 1,
              user_id: user._id,
            });

            await new_message.save();
          }
        }
      );
    } catch (err) {
      console.error(err);
      res.send({ server: true, res: false, alert: "Upload failed" });
    }
  }
);

main.post("/get-all-management-chats", (req, res) => {
  VerifyUser(req.body.token)
    .then(async (user) => {
      await ClientManagementMessage.find({ user_id: user._id }).then(
        (message_data) => {
          res.send({ server: true, res: true, supply: message_data });
        }
      );
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

// events starts here
main.post("/get-events", (req, res) => {
  console.log("hey");
  VerifyUser(req.body.token)
    .then(async () => {
      let banner1_event_data = [];
      let banner2_event_data = [];
      await Banner1.find({}).then(async (banner_1_data) => {
        await Banner2.find({}).then(async (banner_2_data) => {
          if (banner_1_data.length != 0) {
            await Event.findById(banner_1_data[0].event_id)
              .then((b1_event_data) => {
                banner1_event_data.push(b1_event_data);
              })
              .catch((err) => {
                console.log(err);
              });
          }
          await Promise.all(
            banner_2_data.map(async (indi_banner) => {
              await Event.findById(indi_banner.event_id).then(
                async (indi_event) => {
                  banner2_event_data.push(indi_event);
                }
              );
            })
          );
        });
      });

      banner1_event_data.map((item, index) => {
        banner1_event_data[index].event_name = decrypt(
          banner1_event_data[index].event_name
        );
      });
      banner2_event_data.map((item, index) => {
        banner2_event_data[index].event_name = decrypt(
          banner2_event_data[index].event_name
        );
      });

      res.send({
        server: true,
        res: true,
        supply: {
          banner1: banner1_event_data,
          banner2: banner2_event_data,
        },
      });
    })
    .catch((err) => {
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/get-event-info", (req, res) => {
  VerifyUser(req.body.token)
    .then(async () => {
      console.log("in the event info");
      await Event.findById(req.body.id).then((event_info) => {
        if (event_info == null) {
          res.send({
            server: true,
            res: false,
            alert: "Cannot find this event",
          });
        } else {
          event_info.event_name = decrypt(event_info.event_name);
          event_info.description = decrypt(event_info.description);
          event_info.special_note = decrypt(event_info.special_note);
          event_info.event_host = decrypt(event_info.event_host);
          event_info.event_location = decrypt(event_info.event_location);
          event_info.event_virtual_inperson = decrypt(
            event_info.event_virtual_inperson
          );

          event_info.rules = event_info.rules.map(decrypt);

          res.send({ server: true, res: true, supply: event_info });
        }
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, logout: true });
    });
});

module.exports = main;
