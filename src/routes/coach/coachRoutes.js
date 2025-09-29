const express = require("express");
const router = express.Router();
const coachController = require("../../controllers/coach/coachController");
const verifyCoach = require("../../middlewares/coach/verifyCoach");
const verifyAdmin = require("../../middlewares/admin/adminMiddleWare");
const permissions = require("../../configs/permissionConfig");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { profilePicUpload, certificateUpload, workAssetUpload } = require("../../configs/uploadConfig");

// Public routes
router.post("/signup", coachController.signup);
router.post("/verify-otp", coachController.verifyOtp);
router.post("/login", coachController.login);
router.post("/logout", coachController.logout);
router.post("/check-cookie", coachController.checkCookie);
router.post("/check-mobile", coachController.checkMobileAvailability);
router.put("/forget-password", coachController.forgetPassword);

// Authenticated coach routes
router.get("/getMyInfo", verifyCoach(), coachController.getPersonalInfo);
router.put("/updateMyProfile", verifyCoach(), coachController.updateProfile);
router.delete("/deleteCoach/:id", verifyCoach(), coachController.deleteCoach);
router.put("/updatePassword/:id", verifyCoach(), coachController.updatePassword);
router.patch("/coachProfileSetup",verifyCoach(), coachController.coachProfileSetup);
router.patch("/saveStory", verifyCoach(), coachController.saveStory);
router.patch("/coachAgreementTerms", verifyCoach(), coachController.coachAgreementTerms)

// Uploads
router.post("/upload-profile-picture", verifyCoach(), profilePicUpload.single("profilePicture"), coachController.uploadProfilePicture);
router.post("/upload-certificates", verifyCoach(), certificateUpload.array("certificates", 10), coachController.uploadCertificates);
router.patch("/upload-work-asset", verifyCoach(), workAssetUpload.array("workAsset", 3), coachController.uploadWorkAssets);


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

module.exports = router;
