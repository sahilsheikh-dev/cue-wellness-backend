const enu = require("../../essentials/enu");
const Admin = require("../../Database/admin/adminSchema");
const Coach = require("../../Database/coach/coachSchema");
const CoachUnverified2 = require("../../Database/coach/coachUnverified2");
const { encrypt, decrypt } = require("../../essentials/cryptography");

async function VerifyCoach(token) {
  console.log(token);
  return (p = new Promise((resolve, reject) => {
    try {
      CoachUnverified2.findOne({ token: decrypt(token) }).then((res) => {
        if (res == undefined || res == null) {
          reject(false);
        } else {
          resolve(res._id);
        }
      });
    } catch {
      reject(false);
    }
  }));
}

module.exports = VerifyCoach;
