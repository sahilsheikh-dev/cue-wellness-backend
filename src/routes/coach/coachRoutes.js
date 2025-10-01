const express = require("express");
const router = express.Router();
const coachController = require("../../controllers/coach/coachController");
const verifyCoach = require("../../middlewares/coach/verifyCoach");
const verifyAdmin = require("../../middlewares/admin/auth.middleware");
const permissions = require("../../configs/permissionConfig");
const { profilePicUpload, certificateUpload, workAssetUpload } = require("../../configs/uploadConfig");

// Public
router.post("/signup", coachController.signup);
router.post("/verify-otp", coachController.verifyOtp);
router.post("/login", coachController.login);
router.post("/refresh-token", coachController.refreshToken); // <-- new route: exchange refresh token for access token
router.post("/logout", verifyCoach(), coachController.logout); // logout while authorized (revokes current refresh token)
router.post("/logout-all", verifyCoach(), async (req, res) => {
  // optional admin/coach endpoint to clear all sessions - implement via service if needed
  try {
    const coachId = req.coach._id;
    await require("../../services/coach/coachService").clearAllRefreshTokens(coachId);
    res.clearCookie("CoachRefreshToken");
    return res.status(200).json({ ok: true, message: "Logged out from all devices" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal Server Error" });
  }
});
router.post("/check-cookie", coachController.checkCookie);
router.post("/check-mobile", coachController.checkMobileAvailability);
router.put("/forget-password", coachController.forgetPassword);

// Authenticated coach routes
router.get("/me", verifyCoach(), coachController.getPersonalInfo);
router.put("/me", verifyCoach(), coachController.updateProfile);
router.delete("/delete/:id", verifyCoach(), coachController.deleteCoach);
router.put("/updatePassword/:id", verifyCoach(), coachController.updatePassword);
router.patch("/profile-setup", verifyCoach(), coachController.coachProfileSetup);
router.patch("/story", verifyCoach(), coachController.saveStory);
router.patch("/agreement-terms", verifyCoach(), coachController.coachAgreementTerms);

// Uploads
router.post("/upload/profile-picture", verifyCoach(), profilePicUpload.single("profilePicture"), coachController.uploadProfilePicture);
router.post("/upload/certificates", verifyCoach(), certificateUpload.array("certificates", 10), coachController.uploadCertificates);
router.patch("/upload/work-assets", verifyCoach(), workAssetUpload.array("workAsset", 3), coachController.uploadWorkAssets);

// Agreement & sessions
router.post("/save-agreement", verifyCoach(), coachController.saveAgreement);
router.post("/save-pricing-slots", verifyCoach(), coachController.savePricingSlots);

// Like / save
router.post("/like-activity", verifyCoach(), coachController.likeActivity);
router.post("/dislike-activity", verifyCoach(), coachController.dislikeActivity);
router.post("/save-coach", verifyCoach(), coachController.saveCoach);
router.post("/unsave-coach", verifyCoach(), coachController.unsaveCoach);

// Admin-only action: change status
router.get("/admin/list", verifyAdmin(permissions["coach:list"]), coachController.list);
router.get("/admin/get/:id", verifyAdmin(permissions["coach:get"]), coachController.getById);
router.put("/admin/change-status/:id", verifyAdmin(permissions["coach:changeStatus"]), coachController.changeStatus);
router.put("/admin/is-block/:id", verifyAdmin(permissions["coach:changeStatus"]), coachController.blockUnblockCoach);

module.exports = router;
