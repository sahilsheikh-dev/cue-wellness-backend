const main = require("express").Router();
const enu = require("../../essentials/enu");
const getId = require("../../essentials/getId");
const { decrypt, encrypt } = require("../../essentials/cryptography");
const Banner1 = require("../../Database/ad/Banner1Schema.js");
const Banner2 = require("../../Database/ad/Banner2Schema.js");
const Product = require("../../Database/product/productSchema.js");
const ProductUnverified = require("../../Database/product/ProductUnverified.js");
const ProductItemUnverified = require("../../Database/product/ProductItemSchemaUnverified.js");
const ProductItem = require("../../Database/product/ProductItemSchema.js");
const Country = require("../../Database/app/CountrySchema.js");
const Stripe = require("stripe");
const Numbers = require("../../Database/app/Numbers.js");
const multer = require("multer");
const path = require("path");
const VerifyProduct = require("../VerifyProduct.js");
const stripe = Stripe(
  "sk_test_51QUpeKAgw3asoEkc2ztjTMUoVGkqov2j1d7YVmrFJtSipO6gzpFaiVYEx5ZHvph70uG49DimsWprRd38hRHEEdju00IGQpnFEF"
);

const treasure_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../treasure/")); // Ensure the correct folder path
  },
  filename: async (req, file, cb) => {
    console.log("we are here guys");
    const new_name = "product_" + getId(12);
    const customName = req.body.filename || "default_name"; // Ensure req.body is parsed
    const fileExtension = path.extname(file.originalname);
    cb(null, `${new_name}${fileExtension}`);

    req.body.file_name = `${new_name}${fileExtension}`;
    console.log(req.body);
  },
});

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
      case "piuv":
        // this is event verified
        Numbers.findOne({ name: "product_item_unverified" }).then(
          (num_data) => {
            let num_string = "";
            if (num_data.number < 10) {
              num_string = "00" + (num_data.number + 1);
            } else if (num_data.number < 100) {
              num_string = "0" + (num_data.number + 1);
            }

            let code = "PIUV-" + num_string + "-" + new Date().getFullYear();
            resolve(code);
          }
        );
        break;
      case "pi":
        // this is event verified
        Numbers.findOne({ name: "product_item" }).then((num_data) => {
          let num_string = "";
          if (num_data.number < 10) {
            num_string = "00" + (num_data.number + 1);
          } else if (num_data.number < 100) {
            num_string = "0" + (num_data.number + 1);
          }

          let code = "PI-" + num_string + "-" + new Date().getFullYear();
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
    case "piuv":
      await Numbers.findOne({ name: "product_item_unverified" }).then(
        async (num_data) => {
          await Numbers.findByIdAndUpdate(num_data._id, {
            number: num_data.number + 1,
          });
        }
      );
      break;
    case "pi":
      await Numbers.findOne({ name: "product_item" }).then(async (num_data) => {
        await Numbers.findByIdAndUpdate(num_data._id, {
          number: num_data.number + 1,
        });
      });
      break;
  }
}

main.post("/is-verified", async (req, res) => {
  console.log(req.body);
  console.log(decrypt(req.body.token));
  await Product.findOne({ token: decrypt(req.body.token) }).then(
    async (ad_data) => {
      if (ad_data == null) {
        await ProductUnverified.findOne({
          token: decrypt(req.body.token),
        }).then((un_ad_data) => {
          console.log(un_ad_data);
          if (un_ad_data == null) {
            res.send({ server: true, res: false, logout: true });
          } else {
            res.send({ server: true, res: true, supply: false });
          }
        });
      } else {
        res.send({ server: true, res: true, supply: true });
      }
    }
  );
});

main.post("/create-product", (req, res) => {
  const upload = multer({ storage: treasure_storage }).single("product_image");
  // console.log(upload);
  upload(req, res, async () => {
    VerifyProduct(req.body.token)
      .then(async (product_company_info) => {
        const new_product = new ProductItemUnverified({
          product_item_id: await give_me_next_code("piuv"),
          product_company_id: product_company_info._id,
          url: req.body.link,
          product_name: req.body.product_name,
          category: req.body.category,
          country: req.body.country,
          description: req.body.description,
          product_img: req.body.file_name,
        });

        let new_p_saved = await new_product.save();
        increment_code("piuv");
        res.send({ server: true, res: true, supply: new_p_saved._id });
      })
      .catch((err) => {
        console.log(err);
        res.send({ server: true, res: false, logout: true });
      });
  });
});

main.post("/save_agreement", async (req, res) => {
  VerifyProduct(req.body.token)
    .then(async (id) => {
      console.log("here");
      if (enu(req.body.title, req.body.content, req.body.id)) {
        await ProductItemUnverified.findByIdAndUpdate(req.body.id, {
          agreement_terms: {
            title: encrypt(req.body.title),
            content: req.body.content.map((item) => {
              return {
                type: encrypt(item.type),
                content: encrypt(item.content),
              };
            }),
          },
          get_verified: true,
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
      console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

main.post("/is-item-verified", async (req, res) => {
  await ProductItem.findById(req.body.id).then(async (pi_data) => {
    if (pi_data == null) {
      await ProductItemUnverified.findById(req.body.id).then((piuv_data) => {
        if (piuv_data == null) {
          res.send({
            server: true,
            res: true,
            alert: "No such product listed",
          });
        } else {
          res.send({ server: true, res: true, supply: false });
        }
      });
    } else {
      res.send({ server: true, res: true, supply: true });
    }
  });
});

main.post("/all-products", async (req, res) => {
  VerifyProduct(req.body.token)
    .then(async (pc_data) => {
      await ProductItem.find({ product_company_id: pc_data._id }).then(
        async (pi_data) => {
          await ProductItemUnverified.find({
            product_company_id: pc_data._id,
          }).then(async (piu_data) => {
            const updatedPiData = await Promise.all(
              pi_data.map(async (item) => {
                const countryDoc = await Country.findById(item.country);
                // console.log(countryDoc);
                return {
                  ...item,
                  country: countryDoc ? countryDoc.country : item.country, // or countryDoc.name, depending on your schema
                };
              })
            );

            const updatedPiuData = await Promise.all(
              piu_data.map(async (item) => {
                const countryDoc = await Country.findById(item.country);
                // console.log(countryDoc);
                return {
                  ...item,
                  country: countryDoc ? countryDoc.country : item.country,
                };
              })
            );
            res.send({
              server: true,
              res: true,
              supply: {
                verified: updatedPiData,
                unverified: updatedPiuData,
              },
            });
          });
        }
      );
    })
    .catch((err) => {
      res.send({ server: true, res: true, logout: true });
    });
});

main.post("/delete-product", async (req, res) => {
  VerifyProduct(req.body.token)
    .then(async () => {
      if (req.body.verified == true) {
        await ProductItem.findByIdAndDelete(req.body.id).then(() => {
          res.send({ server: true, res: true });
        });
      } else {
        await ProductItemUnverified.findByIdAndDelete(req.body.id).then(() => {
          res.send({ server: true, res: true });
        });
      }
    })
    .catch((err) => {
      res.send({ server: true, res: true, logout: true });
    });
});

module.exports = main;
