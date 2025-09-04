const r = require("express").Router();
const VerifyToken = require("../Auth/VerifyToken");
const Error = require("../../Database/system/error.js");
const enu = require("../../essentials/enu.js");
const Reflection = require("../../Database/Reflection/Reflection.js");
const getId = require("../../essentials/getId.js");
const { encrypt, decrypt } = require("../../essentials/cryptography.js");

// here is the route to add a reflection
r.post("/add-reflection", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      // console.log("here");
      if (enu(req.body.reflection)) {
        const newReflection = new Reflection({
          title: encrypt(req.body.reflection),
          layer: 1,
        });

        await newReflection.save();
        res.send({
          server: true,
          res: true,
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a reflection",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/edit-reflection", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.title)) {
        await Reflection.findByIdAndUpdate(req.body.id, {
          title: encrypt(req.body.title),
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid reflection",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/get-reflections", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.find({ layer: 1 }).then((all_reflections) => {
        let to_send_reflection = [];
        for (let i = 0; i < all_reflections.length; i++) {
          let new_obj = {
            title: decrypt(all_reflections[i].title),
            show_to_coach: all_reflections[i].show_to_coach,
            id: all_reflections[i]._id,
          };

          to_send_reflection.push(new_obj);
        }

        res.send({ server: true, res: true, supply: to_send_reflection });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/get-sub-topics", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.find({ outer_id: req.body.id }).then(
        (all_reflections) => {
          // console.log(all_reflections);
          let to_send_reflection = [];
          for (let i = 0; i < all_reflections.length; i++) {
            let new_obj = {
              title: decrypt(all_reflections[i].title),
              id: all_reflections[i]._id,
              contains_subtopic: all_reflections[i].contains_subtopic,
              contain_questions: all_reflections[i].contain_questions,
              contain_guide: all_reflections[i].contain_guide,
            };

            to_send_reflection.push(new_obj);
          }

          res.send({ server: true, res: true, supply: to_send_reflection });
        }
      );
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/get-questions", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.findById(req.body.id).then((rd) => {
        for (let i = 0; i < rd.questions.length; i++) {
          rd.questions[i].content = decrypt(rd.questions[i].content);
        }
        // console.log(rd.questions);
        res.send({ server: true, res: true, supply: rd.questions });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/add-question", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.findByIdAndUpdate(req.body.sub_topic_id, {
        $push: {
          questions: {
            id: getId(12),
            content: encrypt(req.body.question),
          },
        },
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/delete-question", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.findByIdAndUpdate(req.body.sub_topic_id, {
        $pull: { questions: { id: req.body.id } },
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      // console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/edit-question", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.findOneAndUpdate(
        { _id: req.body.sub_topic_id, "questions.id": req.body.id },
        { $set: { "questions.$.content": encrypt(req.body.content) } }
      ).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/add-guide", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      let new_guide = {
        id: getId(12),
        title: encrypt(req.body.title),
        content: req.body.content.map((item) => {
          return encrypt(item);
        }),
      };

      await Reflection.findByIdAndUpdate(req.body.sub_topic_id, {
        $push: { guide: new_guide },
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      // console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/get-guide", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.findById(req.body.id).then((rd) => {
        console.log(req.body.id);
        console.log(rd);
        for (let i = 0; i < rd.guide.length; i++) {
          rd.guide[i].title = decrypt(rd.guide[i].title);
          for (let j = 0; j < rd.guide[i].content.length; j++) {
            rd.guide[i].content[j] = decrypt(rd.guide[i].content[j]);
          }
        }
        res.send({ server: true, res: true, supply: rd.guide });
      });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/delete-guide", (req, res) => {
  // console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.findByIdAndUpdate(req.body.sub_topic_id, {
        $pull: { guide: { id: req.body.id } },
      }).then(() => {
        res.send({ server: true, res: true });
      });
    })
    .catch((err) => {
      // console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/add-sub-topic", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.sub_topic, req.body.outer_id)) {
        const newReflection = new Reflection({
          title: encrypt(req.body.sub_topic),
          layer: 2,
          outer_id: req.body.outer_id,
        });

        await newReflection.save();
        res.send({
          server: true,
          res: true,
        });
      } else {
        res.send({
          server: true,
          res: true,
          alert: "Please fill all the fields",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/contain-sub-topics", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await Reflection.findByIdAndUpdate(req.body.id, {
          contains_subtopic: true,
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please select a sub topic",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/contain-questions", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await Reflection.findByIdAndUpdate(req.body.id, {
          contain_questions: true,
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please select a sub topic",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/contains-guide", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await Reflection.findByIdAndUpdate(req.body.id, {
          contain_guide: true,
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please select a sub topic",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/edit-sub-topic", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.title)) {
        await Reflection.findByIdAndUpdate(req.body.id, {
          title: encrypt(req.body.title),
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid sub topic",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/delete", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await Reflection.findByIdAndDelete(req.body.id).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({ server: true, res: false, alert: "Invalid selection" });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

r.post("/edit-guide", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Reflection.updateOne(
        { _id: req.body.id, "guide._id": req.body.guide._id },
        {
          $set: {
            "guide.$.title": encrypt(req.body.guide.title),
            "guide.$._id": req.body.guide._id,
            "guide.$.id": req.body.guide.id,
            "guide.$.content": req.body.guide.content.map((item) => {
              return encrypt(item);
            }),
          },
        }
      );

      res.send({ server: true, res: true });
    })
    .catch((err) => {
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

module.exports = r;
