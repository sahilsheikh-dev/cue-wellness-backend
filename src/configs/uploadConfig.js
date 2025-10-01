const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  UPLOADS_BASE_PATH = path.join(process.cwd(), "uploads"),
  PROFILE_PIC_PATH = "profile_pics",
  CERTIFICATES_PATH = "certificates",
  WORK_ASSETS_PATH = "work_assets",
} = process.env;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(subFolder, prefix) {
  const uploadPath = path.join(UPLOADS_BASE_PATH, subFolder);
  ensureDir(uploadPath);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      cb(
        null,
        `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`
      );
    },
  });
}

module.exports = {
  profilePicUpload: multer({
    storage: makeStorage(PROFILE_PIC_PATH, "profile"),
  }),
  certificateUpload: multer({
    storage: makeStorage(CERTIFICATES_PATH, "certificate"),
  }),
  workAssetUpload: multer({ storage: makeStorage(WORK_ASSETS_PATH, "work") }),
};
