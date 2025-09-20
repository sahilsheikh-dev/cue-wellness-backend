const path = require("path");

const storeAssets = (coachId, files, flag) => {
  if (!files || files.length === 0) return [];

  return files.map(file => ({
    complete_path: path.join("uploads", file.filename),
    user_primary_key: coachId,
    flag
  }));
};

module.exports = { storeAssets };
