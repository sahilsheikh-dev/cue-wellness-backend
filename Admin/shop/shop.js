const shop = require("express").Router();
const { encrypt, decrypt } = require("../../essentials/cryptography");
const User = require("../../Database/user/userSchema");
// const Ads = require("../../Database/ad/adSchema.js");
const VerifyToken = require("../Auth/VerifyToken");
const enu = require("../../essentials/enu.js");
const Numbers = require("../../Database/app/Numbers.js");
const ProductUnverified = require("../../Database/product/ProductUnverified.js");
const Product = require("../../Database/product/productSchema.js");

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
      await Numbers.findOne({ name: "product" }).then(async (num_data) => {
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
  }
}

shop.post("/get-all-shops", (req, res) => {
  console.log("in get all shop");
  VerifyToken(req.cookies.AuthToken)
    .then(async (r) => {
      let all_users = [];
      await ProductUnverified.find({}).then(async (result) => {
        // console.log(result);
        result.map((indi_user) => {
          if (indi_user.get_verified == true) {
            let iu = {};
            iu.name = decrypt(indi_user.name);
            iu.verified = false;
            iu._id = indi_user._id;
            iu.contact = indi_user.mobile;
            iu.id = indi_user.product_company_id;
            all_users.push(iu);
          }
        });
        await Product.find({}).then((result2) => {
          result2.map((indi_user) => {
            let iu = {};
            iu.name = decrypt(indi_user.name);
            iu.verified = true;
            iu._id = indi_user._id;
            iu.contact = indi_user.mobile;
            iu.id = indi_user.product_company_id;
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

shop.post("/get-indi-shop", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      if (enu(req.body.id)) {
        await ProductUnverified.findById(req.body.id).then(async (ad_data) => {
          if (ad_data == null) {
            await Product.findById(req.body.id).then((ad_data) => {
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

shop.post("/verify-shop", (req, res) => {
  console.log(req.body);
  VerifyToken(req.cookies.AuthToken)
    .then(() => {
      ProductUnverified.findById(req.body.id).then(async (ad_un_data) => {
        if (ad_un_data == null) {
          res.send({ server: true, res: false, alert: "Something went wrong" });
        } else {
          const new_ad = new Product({
            product_company_id: await give_me_next_code("pc"),
            name: ad_un_data.name,
            password: ad_un_data.password,
            mobile: ad_un_data.mobile,
            token: ad_un_data.token,
            country: ad_un_data.country,
            verified: true,
          });

          await new_ad.save();
          increment_code("pc");
          ProductUnverified.findByIdAndDelete(req.body.id).then(() => {
            res.send({ server: true, res: true });
          });
        }
      });
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

shop.get("/", (req, res) => {
  res.send({ server: true });
});
module.exports = shop;
