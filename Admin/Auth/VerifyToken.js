const enu = require("../../essentials/enu");
const Admin = require("../../Database/admin/adminSchema");
const { encrypt, decrypt } = require("../../essentials/cryptography");
async function VerifyToken(token) {
  return (p = new Promise((resolve, reject) => {
    try {
      Admin.findOne({ token: decrypt(token) }).then((res) => {
        if (res == undefined || res == null) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    } catch {
      reject(false);
    }
  }));
}

module.exports = VerifyToken;
