const Cryptr = require("cryptr");
const cryptr = new Cryptr("cuewellness@ssenlleweuc");

const encrypt = (text) => {
  let new_encrypt_text = cryptr.encrypt(text);
  return new_encrypt_text;
};

const decrypt = (text) => {
  let new_decrypt_text = cryptr.decrypt(text);
  return new_decrypt_text;
};

// module.exports = encrypt;
// module.exports = decrypt;

// how to use encryption and decryption
// const encryptedString = cryptr.encrypt("cuewellness");
// console.log(encryptedString);
// const decryptedString = cryptr.decrypt(encryptedString);
// console.log(decryptedString);

const temp_data = cryptr.decrypt(
  "56396128360c4481109c39dabf1986fe44f485a6af69342a37a482ba9cbd630ff31a7eb62f8427791efcbdcf5c2f28469291828129dd34d4cb08c4874b2a7ce1a023c47382813101dcff867af13a7c6235c53658d9ab76986c12075c473e9b39d9ab70634beb020a921c0b89"
);
console.log(temp_data);

module.exports = {
  encrypt,
  decrypt,
}
