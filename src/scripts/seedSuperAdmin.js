const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin/adminModel");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

async function connect() {
  const dbMode = process.env.DB_MODE || "local";
  let uri;

  if (dbMode === "remote") {
    uri = `mongodb://${process.env.REMOTE_DB_USER}:${process.env.REMOTE_DB_PASS}@${process.env.REMOTE_DB_IP}:27017/${process.env.REMOTE_DB_NAME}?authSource=admin`;
  } else {
    uri = process.env.MONGO_URI_LOCAL;
  }

  mongoose.connect(uri);

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => {
    console.log(`✅ Connected to MongoDB (${dbMode})`);
  });
}

// ------------------- ask() must be defined before main() -------------------
function ask(question) {
  const rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

function askHidden(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    stdout.write(question);
    stdin.resume();
    stdin.setRawMode(true);
    let password = "";
    function onData(ch) {
      ch = String(ch);
      if (ch === "\n" || ch === "\r" || ch === "\u0004") {
        stdin.removeListener("data", onData);
        stdin.setRawMode(false);
        stdout.write("\n");
        stdin.pause();
        resolve(password);
        return;
      }
      if (ch === "\u0003") process.exit(); // ctrl-c
      password += ch;
      stdout.write("*");
    }
    stdin.on("data", onData);
  });
}

async function main() {
  try {
    await connect();
    console.log("Connected to DB.");

    const name = process.env.SUPERADMIN_NAME || (await ask("Name: "));
    const mobile =
      process.env.SUPERADMIN_MOBILE ||
      (await ask("Mobile (with country code, e.g. +91...): "));
    const email =
      process.env.SUPERADMIN_EMAIL || (await ask("Email (optional): "));
    const password =
      process.env.SUPERADMIN_PASSWORD ||
      (await askHidden("Password (input hidden): "));

    if (!name || !mobile || !password) {
      console.error("name, mobile and password are required.");
      process.exit(1);
    }

    const existing = await Admin.findOne({ $or: [{ mobile }, { email }] });
    if (existing) {
      console.error(
        "An admin with that mobile or email already exists. Aborting."
      );
      console.log("Existing admin id:", existing._id.toString());
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = new Admin({
      name,
      mobile,
      email: email || undefined,
      password: hash,
      permissions: [],
      superAdmin: true,
      createdBy: null,
    });

    await admin.save();
    console.log("✅ Super admin created successfully.");
    console.log("Admin id:", admin._id.toString());
    process.exit(0);
  } catch (err) {
    console.error("Error creating super admin:", err);
    process.exit(1);
  }
}

main();

// export REMOTE_DB_USER=cuewellness
// export REMOTE_DB_PASS=Cuewellness00700
// export REMOTE_DB_IP=97.74.94.169
// export REMOTE_DB_NAME=cueWellness-stagging
// node src/scripts/seedSuperAdmin.js
// Connected to DB.
// Name: ✅ Connected to MongoDB (remote)
// Super Admin
// Mobile (with country code, e.g. +91...): +919999999999
// Email (optional): support@cuewellness.net
// Password (input hidden): Password@123
// ✅ Super admin created successfully.
// Admin id: 68dcec63971c3dc845e0a6e2