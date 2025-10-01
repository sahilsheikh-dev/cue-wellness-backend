const Cryptr = require("cryptr");

if (!process.env.CRYPTR_SECRET) {
  if (process.env.NODE_ENV === "production") {
    console.error("❌ CRYPTR_SECRET is missing in .env — exiting");
    process.exit(1);
  } else {
    console.warn("CRYPTR_SECRET missing, falling back to development secret");
  }
}

const cryptr = new Cryptr(process.env.CRYPTR_SECRET || "dev-fallback-secret");

const encrypt = (text) => {
  if (text === null || text === undefined) return null;
  return cryptr.encrypt(String(text));
};

const decrypt = (text) => {
  if (text === null || text === undefined) return null;
  try {
    return cryptr.decrypt(String(text));
  } catch (err) {
    // don't log the token; log minimal info
    console.warn("❌ Decrypt failed (possibly invalid token)");
    return null;
  }
};

module.exports = { encrypt, decrypt };

// EXAMPLES - how to use encryption and decryption
// const encryptedString = cryptr.encrypt("cuewellness");
// console.log(encryptedString);
// const decryptedString = cryptr.decrypt(encryptedString);
// console.log(decryptedString);
