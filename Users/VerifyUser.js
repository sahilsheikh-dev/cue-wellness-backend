const enu = require("../essentials/enu");
const Users = require("../Database/user/userSchema");
const { encrypt, decrypt } = require("../essentials/cryptography");
async function VerifyUser(token) {
  return (p = new Promise((resolve, reject) => {
    try {
      Users.findOne({ token: decrypt(token) }).then((res) => {
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

module.exports = VerifyUser;
