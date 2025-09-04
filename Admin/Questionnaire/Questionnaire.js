const q = require("express").Router();
const VerifyToken = require("../Auth/VerifyToken");
const Guidelines = require("../../Database/questionnaire/GuidelinesSchema");
const Error = require("../../Database/system/error.js");
const Questionnaire_Guidelines = require("../../Database/questionnaire/GuidelinesSchema");
const enu = require("../../essentials/enu.js");
const Questionnaire = require("../../Database/questionnaire/questionnaire.js");
const getId = require("../../essentials/getId.js");
const { encrypt, decrypt } = require("../../essentials/cryptography.js");

q.post("/get-guideline", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async (result) => {
      await Guidelines.findOne({ id: "questionnaire_id_for_guideline" })
        .then((all_guidelines) => {
          if (enu(all_guidelines)) {
            res.send({
              server: true,
              res: true,
              supply: all_guidelines.guideline,
            });
          } else {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying the access the guidelines :- ",
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
            name: "questionnaire",
            file: "admin/questionnaire/questionnaire.js",
            description:
              "the error occured when the admin was trying the access the guidelines :- " +
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

q.post("/save-guideline", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Questionnaire_Guidelines.find({}).then(async (result) => {
        if (result.length == 0) {
          const new_q_g = new Questionnaire_Guidelines({
            id: "questionnaire_id_for_guideline",
            guideline: req.body.guidelines,
          });

          await new_q_g.save();
          res.send({ server: true, res: true });
        } else {
          await Questionnaire_Guidelines.updateOne(
            { id: "questionnaire_id_for_guideline" },
            { guideline: req.body.guidelines }
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

q.post("/get-awareness", (req, res) => {
  console.log(req.cookies);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Questionnaire.find({ layer: 1 })
        .then(async (result) => {
          result.map((item, index) => {
            result[index].title = decrypt(item.title);
          });
          res.send({ server: true, res: true, supply: result });
        })
        .catch((err) => {
          const newError = new Error({
            name: "questionnaire",
            file: "admin/questionnaire/questionnaire.js",
            description:
              "the error occured when the admin was trying the access the awareness :- " +
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

q.post("/add-awareness", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.awareness)) {
        const newAwareness = new Questionnaire({
          title: encrypt(req.body.awareness),
          layer: 1,
        });

        await newAwareness.save();
        res.send({
          server: true,
          res: true,
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter an awareness",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/get-subTopics", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.awareness_id)) {
        await Questionnaire.find({ outer_id: req.body.awareness_id })
          .then((result) => {
            result.map((item, index) => {
              result[index].title = decrypt(item.title);
            });
            res.send({ server: true, res: true, supply: result });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying the access the subtopics :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid awareness id",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/edit-awareness", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      console.log(req.body);
      if (enu(req.body.id, req.body.title)) {
        await Questionnaire.findByIdAndUpdate(req.body.id, {
          title: encrypt(req.body.title),
        })
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying the edit the awareness :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid Topic",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/add-sub-topic", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      console.log(req.body);
      if (enu(req.body.sub_topic, req.body.id)) {
        const newAwareness = new Questionnaire({
          title: encrypt(req.body.sub_topic),
          layer: 2,
          outer_id: req.body.id,
        });

        await newAwareness.save();
        await Questionnaire.findByIdAndUpdate(req.body.id, {
          contains_subtopic: true,
        });
        res.send({
          server: true,
          res: true,
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid sub topic",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/contains-sub-topics", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      console.log(req.body.id);
      Questionnaire.findByIdAndUpdate(req.body.id, {
        contains_subtopic: true,
      })
        .then(() => {
          res.send({ server: true, res: true });
        })
        .catch((err) => {
          const newError = new Error({
            name: "questionnaire",
            file: "admin/questionnaire/questionnaire.js",
            description:
              "the error occured when the admin was trying the access the subtopics :- " +
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
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/edit-sub-topic", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.title)) {
        console.log(req.body + " -- body");
        Questionnaire.findByIdAndUpdate(req.body.id, {
          title: encrypt(req.body.title),
        })
          .then((result) => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying to edit subtopic :- " +
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
      } else {
        res.send({
          server: trye,
          res: false,
          alert: "Please enter a valid sub topic",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/add-question", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      // console.log(req.body.id);
      // console.log(req.body.question);
      if (enu(req.body.id, req.body.question)) {
        await Questionnaire.findByIdAndUpdate(req.body.id, {
          $push: {
            questions: {
              id: getId(12),
              content: encrypt(req.body.question),
            },
          },
        })
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying to add question :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid question",
        });
      }
    })
    .catch((err) => {
      console.log("here");
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/edit-question", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.question_id, req.body.question)) {
        await Questionnaire.findByIdAndUpdate(
          req.body.id,
          {
            $set: {
              "questions.$[ques].content": encrypt(req.body.question),
            },
          },
          {
            arrayFilters: [
              { "ques.id": req.body.question_id }, // Match question
            ],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying to edit question :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid question",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/add-meaning", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      console.log(req.body);
      if (enu(req.body.id, req.body.meaning)) {
        Questionnaire.findByIdAndUpdate(req.body.id, {
          $push: {
            meaning: {
              id: getId(12), // New meaning ID
              content: encrypt(req.body.meaning),
            },
          },
        })
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying to add meaning :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a vlid meaning",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/edit-meaning", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.meaning_id, req.body.meaning)) {
        await Questionnaire.findByIdAndUpdate(
          req.body.id,
          {
            $set: {
              "meaning.$[mean].content": encrypt(req.body.meaning),
            },
          },
          {
            arrayFilters: [
              { "mean.id": req.body.meaning_id }, // Match meaning
            ],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying to edit meaning :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid meaning",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/add-guide", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      if (enu(req.body.id, req.body.guide_title, req.body.guide_content)) {
        Questionnaire.findByIdAndUpdate(req.body.id, {
          $push: {
            guide: {
              id: getId(12), // New meaning ID
              title: encrypt(req.body.guide_title),
              content: encrypt(req.body.guide_content),
            },
          },
        })
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying to add guide :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid guide",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/edit-guide", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (
        enu(
          req.body.id,
          req.body.guide_id,
          req.body.guide_title,
          req.body.guide_content
        )
      ) {
        await Questionnaire.findByIdAndUpdate(
          req.body.id,
          {
            $set: {
              "guide.$[mean].title": encrypt(req.body.guide_title),
              "guide.$[mean].content": encrypt(req.body.guide_content),
            },
          },
          {
            arrayFilters: [
              { "mean.id": req.body.guide_id }, // Match meaning
            ],
          }
        )
          .then(() => {
            res.send({ server: true, res: true });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying to edit guide :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid meaning",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/get-questions", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      console.log(req.body.id + " --  here is the id");
      if (enu(req.body.id)) {
        await Questionnaire.findById(req.body.id)
          .then((result) => {
            result.title = decrypt(result.title);

            result.questions.map((item, index) => {
              result.questions[index].content = decrypt(item.content);
            });

            result.meaning.map((item, index) => {
              result.meaning[index].content = decrypt(item.content);
            });

            result.guide.map((item, index) => {
              result.guide[index].content = decrypt(item.content);
              result.guide[index].title = decrypt(item.title);
            });
            res.send({ server: true, res: true, supply: result });
          })
          .catch((err) => {
            const newError = new Error({
              name: "questionnaire",
              file: "admin/questionnaire/questionnaire.js",
              description:
                "the error occured when the admin was trying the access the questions :- " +
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
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please select a valid sub topic",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

q.post("/delete", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await Questionnaire.findByIdAndDelete(req.body.id).then(() => {
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

q.post("/delete-question", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.sub_topic, req.body.id)) {
        console.log("here qid" + req.body);
        console.log(req.body);
        await Questionnaire.findOneAndUpdate(
          { _id: req.body.sub_topic, "questions.id": req.body.id },
          { $pull: { questions: { id: req.body.id } } }
        ).then(() => {
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

q.post("/delete-meaning", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.sub_topic, req.body.id)) {
        await Questionnaire.findOneAndUpdate(
          { _id: req.body.sub_topic, "meaning.id": req.body.id },
          { $pull: { meaning: { id: req.body.id } } }
        ).then(() => {
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

q.post("/delete-guide", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.sub_topic, req.body.id)) {
        await Questionnaire.findOneAndUpdate(
          { _id: req.body.sub_topic, "guide.id": req.body.id },
          { $pull: { guide: { id: req.body.id } } }
        ).then(() => {
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

module.exports = q;
