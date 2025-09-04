const enu = require("../essentials/enu");
const Product = require("../Database/product/productSchema");
const { encrypt, decrypt } = require("../essentials/cryptography");
async function VerifyProduct(token) {
  return (p = new Promise((resolve, reject) => {
    try {
      Product.findOne({ token: decrypt(token) }).then((res) => {
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

module.exports = VerifyProduct;
