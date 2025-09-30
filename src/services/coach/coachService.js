// services/coach/coachService.js
const Coach = require("../../models/coach/coachModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");
const validateInputs = require("../../utils/validateInputs.util");
const path = require("path");
const fs = require("fs");

const {
  UPLOADS_BASE_PATH,
  PROFILE_PIC_PATH,
  CERTIFICATES_PATH,
  WORK_ASSETS_PATH,
  SERVER_BASE_URL,
} = process.env;

const BASE_URL =
  SERVER_BASE_URL || `http://localhost:${process.env.PORT || 9000}`;

function logWarn(prefix, filePath, err) {
  console.warn(
    prefix,
    filePath,
    process.env.NODE_ENV === "development" ? err.stack : err.message
  );
}

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

  return formatCoach(updatedCoach);
}

async function saveStoryService(payload) {
  // Update only story field
  const coach = await Coach.findOneAndUpdate(
    { _id: payload.id },
    { $set: { story: payload.story } },
    { new: true }
  );

  return formatCoach(coach);
}

async function coachAgreementTermsService(payload) {
  const coach = await Coach.findByIdAndUpdate(
    payload.id,
    { $set: { agreement_terms: payload.agreement_terms } },
    { new: true }
  ).lean(); // <- return plain JS object without Mongoose metadata

  return coach; // or formatCoach(coach) if you really need custom shaping
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

// Block / Unblock coach
async function toggleBlockStatus(id, isBlocked) {
  const coach = await Coach.findById(id);
  if (!coach) return null;

  coach.isBlocked = isBlocked;
  await coach.save();

  return formatCoach(coach);
}

// add certificate
async function addCertificates(coachId, indexes, files) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;

  const fileMap = {};
  for (let i = 0; i < files.length; i++) {
    fileMap[
      indexes[i]
    ] = `${BASE_URL}/uploads/${CERTIFICATES_PATH}/${files[i].filename}`;
  }

  for (const idx of indexes) {
    const existingCertIndex = coach.certificates.findIndex(
      (c) => c.index === idx
    );
    if (fileMap[idx]) {
      if (existingCertIndex !== -1) {
        coach.certificates[existingCertIndex].path = fileMap[idx];
      } else {
        coach.certificates.push({ index: idx, path: fileMap[idx] });
      }
    } else if (existingCertIndex !== -1) {
      const oldUrl = coach.certificates[existingCertIndex].path;
      const filename = oldUrl.split("/").pop();
      const oldFilePath = path.join(
        UPLOADS_BASE_PATH,
        CERTIFICATES_PATH,
        filename
      );
      try {
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      } catch (err) {
        logWarn("Certificate delete failed:", oldFilePath, err);
      }
      coach.certificates.splice(existingCertIndex, 1);
    }
  }

  await coach.save();
  return formatCoach(coach);
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

// helper: format coach for responses (remove sensitive fields, normalize media paths)
function formatCoach(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));
  delete d.password;

  const normalizeToPublicUrl = (stored) => {
    if (!stored) return stored;
    if (/^https?:\/\//i.test(stored)) return stored;

    if (stored.includes(path.sep) || stored.startsWith("/")) {
      const filename = stored.split(path.sep).pop();
      return `${BASE_URL}/uploads/${CERTIFICATES_PATH}/${filename}`;
    }

    if (stored.includes("/")) {
      const parts = stored.split("/");
      const filename = parts.pop();
      const folderCandidate = parts.length ? parts[0] : null;
      if (folderCandidate === PROFILE_PIC_PATH)
        return `${BASE_URL}/uploads/${PROFILE_PIC_PATH}/${filename}`;
      if (folderCandidate === CERTIFICATES_PATH)
        return `${BASE_URL}/uploads/${CERTIFICATES_PATH}/${filename}`;
      if (folderCandidate === WORK_ASSETS_PATH)
        return `${BASE_URL}/uploads/${WORK_ASSETS_PATH}/${filename}`;
      return `${BASE_URL}/uploads/${CERTIFICATES_PATH}/${filename}`;
    }
    return stored;
  };

  if (d.profilePicture)
    d.profilePicture = normalizeToPublicUrl(d.profilePicture);
  if (Array.isArray(d.certificates)) {
    d.certificates = d.certificates.map((c) => ({
      ...c,
      path: normalizeToPublicUrl(c.path),
    }));
  }
  if (Array.isArray(d.workAssets)) {
    d.workAssets = d.workAssets.map((w) => ({
      ...w,
      path: normalizeToPublicUrl(w.path),
    }));
  }
  return d;
}

// Set Profile Picture
async function setProfilePicture(id, fullFilePath) {
  const coach = await Coach.findById(id);
  if (!coach) return null;

  if (coach.profilePicture) {
    const oldUrl = coach.profilePicture;
    const filename = oldUrl.split("/").pop();
    const oldFilePath = path.join(
      UPLOADS_BASE_PATH,
      PROFILE_PIC_PATH,
      filename
    );
    try {
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    } catch (err) {
      logWarn("Old profile picture not deleted:", oldFilePath, err);
    }
  }

  const relative = `${PROFILE_PIC_PATH}/${path.basename(fullFilePath)}`;
  coach.profilePicture = `${BASE_URL}/uploads/${relative}`;
  await coach.save();
  return formatCoach(coach);
}

// add work assets
async function setWorkAssets(coachId, indexes, files) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;

  for (let i = 0; i < indexes.length; i++) {
    const idx = indexes[i];
    const file = files.find((f, fIndex) => indexes[fIndex] === idx);
    const existingAsset = coach.workAssets.find((w) => w.index === idx);

    if (file) {
      const type = file.mimetype.startsWith("image") ? "image" : "video";
      const relative = `${WORK_ASSETS_PATH}/${file.filename}`;
      const publicPath = `${BASE_URL}/uploads/${relative}`;

      if (existingAsset) {
        const oldUrl = existingAsset.path;
        const filename = oldUrl.split("/").pop();
        const oldFilePath = path.join(
          UPLOADS_BASE_PATH,
          WORK_ASSETS_PATH,
          filename
        );
        try {
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (err) {
          logWarn("Old work asset not deleted:", oldFilePath, err);
        }
        existingAsset.path = publicPath;
        existingAsset.type = type;
      } else {
        coach.workAssets.push({ index: idx, path: publicPath, type });
      }
    } else if (existingAsset) {
      const oldUrl = existingAsset.path;
      const filename = oldUrl.split("/").pop();
      const oldFilePath = path.join(
        UPLOADS_BASE_PATH,
        WORK_ASSETS_PATH,
        filename
      );
      try {
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      } catch (err) {
        logWarn("Work asset delete failed:", oldFilePath, err);
      }
      coach.workAssets = coach.workAssets.filter((w) => w.index !== idx);
    }
  }

  await coach.save();
  return formatCoach(coach);
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

async function forgetPasswordService(mobile, newPassword) {
  if (!mobile) throw new Error("Mobile number is required");

  const coach = await Coach.findOne({ mobile });
  if (!coach) return null;

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
  toggleBlockStatus,
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
  forgetPasswordService,
};
