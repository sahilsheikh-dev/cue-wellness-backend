const c = require("express").Router();
const VerifyToken = require("../Auth/VerifyToken");
const Error = require("../../Database/system/error.js");
const enu = require("../../essentials/enu.js");
const Connection = require("../../Database/connection/Connections.js");
const getId = require("../../essentials/getId.js");
const { encrypt, decrypt } = require("../../essentials/cryptography.js");

// here is the route to add a connection
c.post("/add-connection", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      console.log("here");
      if (enu(req.body.connection)) {
        const newConnection = new Connection({
          title: encrypt(req.body.connection),
          layer: 1,
        });

        await newConnection.save();
        res.send({
          server: true,
          res: true,
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a connection",
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

c.post("/edit-connection", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.title)) {
        await Connection.findByIdAndUpdate(req.body.id, {
          title: encrypt(req.body.title),
        }).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        res.send({
          server: true,
          res: false,
          alert: "Please enter a valid connection",
        });
      }
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

c.post("/get-connections", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Connection.find({ layer: 1 }).then((all_connections) => {
        let to_send_connection = [];
        for (let i = 0; i < all_connections.length; i++) {
          let new_obj = {
            title: decrypt(all_connections[i].title),
            show_to_coach: all_connections[i].show_to_coach,
            id: all_connections[i]._id,
          };

          to_send_connection.push(new_obj);
        }

        res.send({ server: true, res: true, supply: to_send_connection });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

c.post("/get-sub-topics", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await Connection.find({ outer_id: req.body.id }).then(
        (all_connections) => {
          // console.log(all_connections);
          let to_send_connection = [];
          for (let i = 0; i < all_connections.length; i++) {
            let new_obj = {
              title: decrypt(all_connections[i].title),
              id: all_connections[i]._id,
              contains_subtopic: all_connections[i].contains_subtopic,
            };

            to_send_connection.push(new_obj);
          }

          res.send({ server: true, res: true, supply: to_send_connection });
        }
      );
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

c.post("/add-sub-topic", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.sub_topic, req.body.outer_id)) {
        const newConnection = new Connection({
          title: encrypt(req.body.sub_topic),
          layer: 2,
          outer_id: req.body.outer_id,
        });

        await newConnection.save();
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

c.post("/contain-sub-topics", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await Connection.findByIdAndUpdate(req.body.id, {
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

c.post("/edit-sub-topic", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id, req.body.title)) {
        await Connection.findByIdAndUpdate(req.body.id, {
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

c.post("/delete", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await Connection.findByIdAndDelete(req.body.id).then(() => {
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

module.exports = c;
