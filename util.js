const Cryptr = require("cryptr");
const cryptr = new Cryptr("cuewellness@ssenlleweuc");

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

// how to use encryption and decryption
const encryptedString = cryptr.encrypt("cuewellness");
const decryptedString = cryptr.decrypt(encryptedString);

console.log(encryptedString);
console.log(decryptedString);

const temp_data = cryptr.decrypt(
  "de3e48056291a31c198078b8c3f9153d3f77f63749875a7a1b2054df83da4e86d7899d244bb403d4134a3b0348bc34f3f6cb8c536c7b4aab9c0dde1e6141213de5f9007910af50b50d714e8686da449bd1f39a1454831fc0538d3f8367cbccf410ecbacb609a8794"
);
console.log(temp_data);
