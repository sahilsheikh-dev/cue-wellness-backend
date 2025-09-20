const Cryptr = require("cryptr");

if (!process.env.CRYPTR_SECRET) {
  console.error("❌ CRYPTR_SECRET is missing in .env");
}

const cryptr = new Cryptr(process.env.CRYPTR_SECRET || "default_fallback");

const encrypt = (text) => {
  if (!text) return null;
  return cryptr.encrypt(text);
};

const decrypt = (text) => {
  if (!text) return null;
  try {
    return cryptr.decrypt(text);
  } catch (err) {
    console.error("❌ Decrypt failed:", text, err.message);
    return null;
  }
};

module.exports = { encrypt, decrypt };

// EXAMPLES - how to use encryption and decryption
// const encryptedString = cryptr.encrypt("cuewellness");
// console.log(encryptedString);
// const decryptedString = cryptr.decrypt(encryptedString);
// console.log(decryptedString);
