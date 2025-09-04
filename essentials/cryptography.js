const Cryptr = require("cryptr");
const cryptr = new Cryptr("cuewellness@ssenlleweuc");

// how to use encryption and decryption
// const encryptedString = cryptr.encrypt("cuewellness");
// const decryptedString = cryptr.decrypt(encryptedString);

module.exports.encrypt = (text) => {
  let new_encrypt_text = cryptr.encrypt(text);
  return new_encrypt_text;
};

module.exports.decrypt = (text) => {
  let new_decrypt_text = cryptr.decrypt(text);
  return new_decrypt_text;
};

// module.exports = encrypt;
// module.exports = decrypt;
