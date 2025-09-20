const express = require("express");
const router = express.Router();
const controller = require("../../controllers/coach/coachController");
//const upload = require("../../middlewares/coach/upload");
const uploadAsset = require("../../middlewares/coach/uploadMiddleWare")
const coachAuthMiddleWare = require("../../middlewares/coach/coachAuthMiddleWare")

// root
router.get("/", controller.root);

router.post("/signup", controller.signup);
router.post("/otp", controller.verifyOtp);
router.post("/resend-otp", controller.resendOtp);
router.post("/build-profile", controller.buildProfile);
router.post("/get-languages", controller.getLanguages);
router.post("/get-connections", controller.getConnections);
router.post("/get-sub-connections", controller.getSubConnections);
//router.post("/save-certificates", upload.array("images", 10), controller.saveCertificates);
router.post("/save_agreement", controller.saveAgreement);
router.delete("/delete-coach", controller.deleteCoach);
router.post("/upload", coachAuthMiddleWare, uploadAsset.array("files", 10), controller.uploadAssets);


module.exports = router;
