// services/coach/coachService.js
const Coach = require("../../models/coach/coachModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");
const validateInputs = require("../../utils/validateInputs.util");
const fs = require("fs");

/**
 * Note: this service contains ALL database operations and formatting/transformations.
 * Controller should NOT do any DB calls.
 */

// Create (signup) - unverified coach
async function createUnverifiedCoach({
  name,
  password,
  mobile,
  mobileVerified,
  agree_terms_conditions,
  agree_privacy_policy,
  token,
}) {
  // check if mobile already exists
  const exists = await Coach.findOne({ mobile });
  if (exists) throw new Error("Mobile number already registered");

  const newCoach = new Coach({
    name,
    mobile,
    password: encrypt(password),
    mobileVerified: !!mobileVerified,
    agree_terms_conditions,
    agree_privacy_policy,
    token,
  });

  await newCoach.save();
  return newCoach;
}

// Verify OTP record and set token + mobileVerified (all DB work here)
async function processOtpVerification(otpRecord) {
  // otpRecord is expected to be the OtpRequest document returned by otpService.verifyOtp
  if (!otpRecord) return { token: null, coach: null };

  let coach;
  if (otpRecord.meta && otpRecord.meta.coachId) {
    coach = await Coach.findById(otpRecord.meta.coachId);
  } else if (otpRecord.phone) {
    coach = await Coach.findOne({ mobile: otpRecord.phone });
  }

  if (!coach) return { token: null, coach: null };

  // set token
  const token = getId(12);
  coach.token = token;
  coach.mobileVerified = true;

  // bump status only if currently unverified
  if (coach.status === "unverified") {
    coach.status = "pending";
  }

  await coach.save();
  return { token, coach: formatCoach(coach) };
}

// Set token for coach by id (used elsewhere)
async function setTokenForCoachById(coachId) {
  const token = getId(12);
  const coach = await Coach.findByIdAndUpdate(
    coachId,
    { token },
    { new: true }
  );
  return { coach: coach ? formatCoach(coach) : null, token };
}

// Login
async function login(mobile, password) {
  const coach = await Coach.findOne({ mobile });
  if (!coach) return null;
  if (decrypt(coach.password) !== password) return null;

  const token = getId(12);
  coach.token = token;
  await coach.save();
  return formatCoach(coach); // includes token
}

// Logout
async function logout(token) {
  const coach = await Coach.findOne({ token });
  if (!coach) return null;
  coach.token = null;
  await coach.save();
  return formatCoach(coach);
}

// get by id (public)
async function getCoachById(id) {
  const coach = await Coach.findById(id);
  if (!coach) return null;
  return formatCoach(coach);
}

// get by token (used by checkCookie) - returns formatted coach
async function getCoachByToken(token) {
  if (!token) return null;
  const coach = await Coach.findOne({ token });
  if (!coach) return null;
  return formatCoach(coach);
}

// list with pagination and optional filters (status, search)
async function listCoaches({ page = 1, limit = 20, status, q } = {}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (status) filter.status = status;
  if (q)
    filter.$or = [
      { mobile: { $regex: q, $options: "i" } },
      // Note: searching encrypted fields is not reliable
    ];

  const docs = await Coach.find(filter).skip(skip).limit(limit);
  return docs.map(formatCoach);
}

// update profile (encrypt name/password/email if present)
async function updateCoach(id, data) {
  const update = { ...data };
  if (data.name) update.name = encrypt(data.name);
  if (data.password) update.password = encrypt(data.password);
  if (data.email) update.email = encrypt(data.email);

  const updated = await Coach.findByIdAndUpdate(id, update, { new: true });
  return updated ? formatCoach(updated) : null;
}
// coachile profile building service
async function coachProfileSetupService(payload) {
  // Build only allowed fields
  const updateObj = {};

  if (payload.email) updateObj.email = payload.email;
  if (payload.dob) updateObj.dob = new Date(payload.dob);
  if (payload.gender) updateObj.gender = payload.gender;
  if (payload.country) updateObj.country = payload.country;
  if (payload.city) updateObj.city = payload.city;
  if (payload.address) updateObj.address = payload.address;
  if (payload.pincode) updateObj.pincode = payload.pincode;
  if (payload.experience_since_date)
    updateObj.experience_since_date = new Date(payload.experience_since_date);

  if (typeof payload.agree_certification === "boolean")
    updateObj.agree_certification = payload.agree_certification;
  if (typeof payload.agree_experience === "boolean")
    updateObj.agree_experience = payload.agree_experience;
  if (typeof payload.agree_refund === "boolean")
    updateObj.agree_refund = payload.agree_refund;

  if (payload.my_activities) updateObj.my_activities = payload.my_activities;
  if (payload.accepted_genders)
    updateObj.accepted_genders = payload.accepted_genders;
  if (payload.accepted_languages)
    updateObj.accepted_languages = payload.accepted_languages;

  const updatedCoach = await Coach.findOneAndUpdate(
    { _id: payload.id },
    { $set: updateObj },
    { new: true }
  );

  return updatedCoach;
}

async function saveStoryService(payload) {
  // Update only story field
  const coach = await Coach.findOneAndUpdate(
    { _id: payload.id },
    { $set: { story: payload.story } },
    { new: true }
  );

  return coach;
}

async function coachAgreementTermsService(payload) {
  const coach = Coach.findByIdAndUpdate(
    { _id: payload.id },
    { $set: { agreement_terms: payload.agreement_terms } },
    { new: true }
  );

  return coach;
}

// admin verify: change status
async function changeCoachStatus(id, status) {
  if (!["unverified", "pending", "verified"].includes(status)) {
    throw new Error("Invalid status");
  }
  const coach = await Coach.findById(id);
  if (!coach) return null;
  coach.status = status;
  coach.verified = status === "verified";
  await coach.save();
  return formatCoach(coach);
}

async function addCertificates(coachId, indexes, files) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;

  // Map of file paths by index for quick lookup
  const fileMap = {};
  for (let i = 0; i < files.length; i++) {
    fileMap[indexes[i]] = files[i].path;
  }

  // Iterate over all indexes sent from frontend
  for (const idx of indexes) {
    const existingCertIndex = coach.certificates.findIndex(c => c.index === idx);

    // Check if a file is provided for this index
    if (fileMap[idx]) {
      // File is uploaded → replace or add
      if (existingCertIndex !== -1) {
        // Delete old file
        try { fs.unlinkSync(coach.certificates[existingCertIndex].path); } 
        catch (err) { console.warn("Old file not found:", coach.certificates[existingCertIndex].path); }

        coach.certificates[existingCertIndex].path = fileMap[idx]; // update path
      } else {
        // Add new certificate
        coach.certificates.push({ index: idx, path: fileMap[idx] });
      }
    } else {
      // No file → delete existing record and file
      if (existingCertIndex !== -1) {
        try { fs.unlinkSync(coach.certificates[existingCertIndex].path); } 
        catch (err) { console.warn("File not found:", coach.certificates[existingCertIndex].path); }

        coach.certificates.splice(existingCertIndex, 1); // remove from array
      }
    }
  }

  await coach.save();
  return coach;
}



// save agreement
async function saveAgreement(id, title, contentArr) {
  const formatted = {
    title,
    content: (contentArr || []).map((i) => ({
      type: i.type,
      content: i.content,
    })),
  };
  const updated = await Coach.findByIdAndUpdate(
    id,
    { agreement_terms: formatted },
    { new: true }
  );
  return updated ? formatCoach(updated) : null;
}

// save pricing & slots for a given level/session path
async function saveSessionSlots(id, categoryId, sessionKey, level, payload) {
  const coach = await Coach.findById(id);
  if (!coach) return null;

  const catIndex = (coach.category || []).findIndex((c) => c.id === categoryId);
  if (catIndex === -1) throw new Error("Category not found");

  coach.category[catIndex].levelOfExpertise =
    coach.category[catIndex].levelOfExpertise || [];
  if (!coach.category[catIndex].levelOfExpertise.includes(level)) {
    coach.category[catIndex].levelOfExpertise.push(level);
  }

  coach.category[catIndex].session = coach.category[catIndex].session || {};
  coach.category[catIndex].session[sessionKey] = payload;
  await coach.save();
  return formatCoach(coach);
}

// save liked / saved coaches utility
async function toggleLikeActivity(coachId, activityId, action = "add") {
  if (action === "add") {
    await Coach.findByIdAndUpdate(coachId, {
      $addToSet: { liked_activities: activityId },
    });
  } else {
    await Coach.findByIdAndUpdate(coachId, {
      $pull: { liked_activities: activityId },
    });
  }
  const coach = await Coach.findById(coachId);
  return formatCoach(coach);
}
async function toggleSaveCoach(coachId, savedCoachId, action = "add") {
  if (action === "add") {
    await Coach.findByIdAndUpdate(coachId, {
      $addToSet: { saved_coaches: savedCoachId },
    });
  } else {
    await Coach.findByIdAndUpdate(coachId, {
      $pull: { saved_coaches: savedCoachId },
    });
  }
  const coach = await Coach.findById(coachId);
  return formatCoach(coach);
}

// helper: format coach for responses (remove sensitive fields, decrypt where needed)
function formatCoach(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));

  // Remove sensitive fields for response
  delete d.password;

  // Optionally keep token in response (controller uses it for cookie).
  // If you want to hide the raw token from clients, remove it here and return a short-lived jwt instead.
  // For now, keep token because your controllers expect it.
  return d;
}

// Set Profile Picture
async function setProfilePicture(id, filename) {
  const updated = await Coach.findByIdAndUpdate(
    id,
    { profilePicture: filename },
    { new: true }
  );
  return formatCoach(updated);
}

// Set Work Images (max 3)
async function setWorkAssets(id, files) {
  const workAssets = files.map((f) => ({
    type: f.mimetype && f.mimetype.startsWith("image") ? "image" : "video",
    path: f.filename,
  }));
  const updated = await Coach.findByIdAndUpdate(
    {_id:id},
    { workAssets },
    { new: true }
  );
  return formatCoach(updated);
}

// Build / update coach profile
async function buildProfile(payload) {
  // Parse DOB from MM-DD-YYYY
  let dob = null;
  if (payload.dob) {
    const parts = payload.dob.split("-").map(Number);
    if (parts.length === 3) {
      const [month, day, year] = parts;
      dob = new Date(year, month - 1, day);
    }
  }

  const tokenDecrypted = decrypt(payload.token);

  const updateObj = {
    email: encrypt(payload.email),
    dob,
    gender: encrypt(payload.gender),
    pinCode: encrypt(payload.pin_code),
    country: payload.country,
    city: encrypt(payload.city),
    address: encrypt(payload.address),
    experience_year: encrypt(String(payload.experience?.year || "")),
    experience_months: encrypt(String(payload.experience?.months || "")),
    category: (payload.category || []).map((item) => ({
      id: item.id,
      coach_experties_level: item.coach_experties_level,
      session: (item.session || []).map((s) => ({
        client_experties_level: s.client_experties_level,
        session_type: s.session_type,
        avg_time: s.avg_time,
        avg_price: s.avg_price,
        currency: s.currency,
        slots: s.slots || [],
      })),
    })),
    client_gender: (payload.client_gender || []).map((g) => encrypt(g)),
    languages: (payload.languages || []).map((l) => l._id || l),
    verified: false,
  };

  const updatedCoach = await Coach.findOneAndUpdate(
    { token: tokenDecrypted },
    updateObj,
    { new: true }
  );

  return updatedCoach ? formatCoach(updatedCoach) : null;
}

// Delete coach
async function deleteCoach(coachId) {
  const deletedCoach = await Coach.findByIdAndDelete(coachId);
  return deletedCoach ? formatCoach(deletedCoach) : null;
}

// Update password
async function updatePassword(coachId, oldPassword, newPassword) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;

  const currentPassword = decrypt(coach.password);
  if (currentPassword !== oldPassword) {
    return { error: "Old password is incorrect" };
  }

  coach.password = encrypt(newPassword);
  await coach.save();
  return formatCoach(coach);
}

// Check Mobile Number
async function isMobileAvailable(mobile) {
  if (!mobile) throw new Error("Mobile number is required");

  const coach = await Coach.findOne({ mobile });
  return !coach; // true if not found, meaning available
}

module.exports = {
  createUnverifiedCoach,
  processOtpVerification,
  setTokenForCoachById,
  login,
  logout,
  getCoachById,
  getCoachByToken,
  listCoaches,
  updateCoach,
  changeCoachStatus,
  addCertificates,
  saveAgreement,
  saveSessionSlots,
  toggleLikeActivity,
  toggleSaveCoach,
  setProfilePicture,
  setWorkAssets,
  coachProfileSetupService,
  saveStoryService,
  coachAgreementTermsService,
  buildProfile,
  deleteCoach,
  updatePassword,
  formatCoach,
  isMobileAvailable,
};
