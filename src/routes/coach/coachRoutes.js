const express = require("express");
const router = express.Router();
const coachController = require("../../controllers/coach/coachController");
const verifyCoach = require("../../middlewares/coach/verifyCoach");
const verifyAdmin = require("../../middlewares/admin/adminMiddleWare");
const permissions = require("../../configs/permissionConfig");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  UPLOADS_BASE_PATH,
  PROFILE_PIC_PATH,
  CERTIFICATES_PATH,
  WORK_IMAGES_PATH,
} = process.env;

// Utility: build multer storage
function makeStorage(subPath) {
  const uploadPath = path.join(__dirname, "../../", UPLOADS_BASE_PATH, subPath);
  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) =>
      cb(
        null,
        `${subPath}_${Date.now()}_${Math.round(
          Math.random() * 1e9
        )}${path.extname(file.originalname)}`
      ),
  });
}

const uploadProfilePic = multer({ storage: makeStorage(PROFILE_PIC_PATH) });
const uploadCertificates = multer({ storage: makeStorage(CERTIFICATES_PATH) });
const uploadWorkImages = multer({ storage: makeStorage(WORK_IMAGES_PATH) });

// Public routes
router.post("/signup", coachController.signup);
router.post("/verify-otp", coachController.verifyOtp);
router.post("/login", coachController.login);
router.post("/logout", coachController.logout);
router.post("/check-cookie", coachController.checkCookie);
router.post("build-profile",coachController.buildProfile)
// router.post("/check-cookie", coachController.checkCookie);     // PENDING

// Authenticated coach routes
router.get("/gerMyInfo", verifyCoach(), coachController.getPersonalInfo);
router.put("/updateMyProfile", verifyCoach(), coachController.updateProfile);
// router.put("/changeMyPassword", verifyCoach(), coachController.changePassword);    // PENDING
// router.delete("/deleteMyAccount", verifyCoach(), coachController.deleteAccount);    // PENDING

// Uploads
router.post("/upload-profile-picture", verifyCoach(), uploadProfilePic.single("profilePicture"), coachController.uploadProfilePicture);
router.post("/upload-certificates", verifyCoach(), uploadCertificates.array("certificates", 10), coachController.uploadCertificates);
router.post("/upload-work-images", verifyCoach(), uploadWorkImages.array("workImages", 3), coachController.uploadWorkAssets);

// Agreement & sessions
router.post("/save-agreement", verifyCoach(), coachController.saveAgreement);
router.post("/save-pricing-slots", verifyCoach(), coachController.savePricingSlots);

// Like / save
router.post("/like-activity", verifyCoach(), coachController.likeActivity);
router.post("/dislike-activity", verifyCoach(), coachController.dislikeActivity);
router.post("/save-coach", verifyCoach(), coachController.saveCoach);
router.post("/unsave-coach", verifyCoach(), coachController.unsaveCoach);

// Admin-only action: change status
router.get("/list", verifyAdmin(permissions["coach:list"]), coachController.list);
router.get("/get/:id", verifyAdmin(permissions["coach:get"]), coachController.getById);
router.put("/admin/change-status/:id", verifyAdmin(permissions["coach:changeStatus"]), coachController.changeStatus);
router.delete("/deleteCoach/:id", verifyCoach(), coachController.deleteCoach);
router.updatePassword("/updatePassword/:id", verifyCoach(), coachController.updatePassword);

module.exports = router;
