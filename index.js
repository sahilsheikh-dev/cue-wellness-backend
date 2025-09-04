const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");

// importing files here
const admin = require("./Admin/Admin");
const users = require("./Users/Users");
const coaches = require("./Coaches/Coaches");
const Ad = require("./Ad/Ad");
const product = require("./Product/product");
const connection = require("./Database/connection");
const Numbers = require("./Database/app/Numbers");
// const { encrypt } = require("./essentials/cryptography");

// connecting with the database
connection();

// const {
//   TermsAndConditionsClient,
//   TermsAndConditionsCoach,
//   TermsAndConditionsAd,
//   TermsAndConditionsShop,
// } = require("./Database/app/TermsAndConditions");

// checking if number is empty or not
Numbers.find({}).then(async (all_num) => {
  if (all_num.length == 0) {
    const client_num = new Numbers({
      name: "client",
      number: 0,
    });
    await client_num.save();
    const coach_unverified_num = new Numbers({
      name: "coach_unverified",
      number: 0,
    });
    await coach_unverified_num.save();
    const coach_num = new Numbers({
      name: "coach",
      number: 0,
    });
    await coach_num.save();
    const staff_num = new Numbers({
      name: "staff",
      number: 0,
    });
    await staff_num.save();
    const management_num = new Numbers({
      name: "management",
      number: 0,
    });
    await management_num.save();
    const eouv_num = new Numbers({
      name: "event_unverified",
      number: 0,
    });
    await eouv_num.save();
    const eo_num = new Numbers({
      name: "event",
      number: 0,
    });
    await eo_num.save();
    const pc_num = new Numbers({
      name: "product",
      number: 0,
    });
    await pc_num.save();
    const pcuv_num = new Numbers({
      name: "product_unverified",
      number: 0,
    });
    await pcuv_num.save();
    const bill_num = new Numbers({
      name: "bill",
      number: 0,
    });
    await bill_num.save();
    const booking_num = new Numbers({
      name: "booking",
      number: 0,
    });
    await booking_num.save();
  }
});

const app = express();
// here will be all the things that will be used or set
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./treasure"));
const treasure_storage = multer.diskStorage({
  destination: "./treasure/",
  filename: (req, file, cb) => {
    const customName = req.body.filename || "default_name"; // Use filename from request or default
    const fileExtension = path.extname(file.originalname); // Get the original file extension
    cb(null, `${customName}${fileExtension}`); // Set the custom name with extension
  },
});
app.use(
  cors({
    origin: (origin, callback) => callback(null, origin || true),
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.listen(9000, () => {
  console.log("app running at port 9000");
});

app.get("/", (req, res) => {
  console.log("here we are");
  res.send("get back this");
});

// const decryptAndSaveTermsAndConditions = async () => {
//   try {
//     const doc = await TermsAndConditionsClient.findOne({
//       id: "id_for_termsandconditions",
//     });

//     if (!doc) {
//       console.log("No document found with the given ID.");
//       return;
//     }

//     // Decrypt each term and replace content
//     // doc.termsAndConditions = doc.termsAndConditions.map((term) => ({
//     //   ...(term.toObject?.() || term),
//     //   content: decrypt(term.content),
//     // }));

//     let tandc = doc.termsAndConditions;
//     for (let i = 0; i < tandc.length; i++) {
//       console.log("hey");
//       tandc[i].content = encrypt(tandc[i].content);
//     }

//     await TermsAndConditionsClient.findByIdAndUpdate(doc._id, {
//       termsAndConditions: tandc,
//     });

//     // Save updated document
//     // await doc.save();
//     console.log("Terms and conditions decrypted and saved successfully.");
//   } catch (err) {
//     console.error(
//       "Error while decrypting and saving terms and conditions:",
//       err
//     );
//   }
// };

// decryptAndSaveTermsAndConditions();

// connection things
app.use("/admin", admin);
app.use("/user", users);
app.use("/coach", coaches);
app.use("/ad", Ad);
app.use("/product", product);
