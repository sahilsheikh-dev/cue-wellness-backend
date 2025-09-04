const enu = require("../../essentials/enu");
const Ad = require("../../Database/ad/adSchema.js");
const { encrypt, decrypt } = require("../../essentials/cryptography");
async function VerifyAd(token) {
  return (p = new Promise((resolve, reject) => {
    try {
      Ad.findOne({ token: decrypt(token) }).then((res) => {
        if (res == undefined || res == null) {
          reject(false);
        } else {
          resolve(res);
        }
      });
    } catch {
      reject(false);
    }
  }));
}

module.exports = VerifyAd;
