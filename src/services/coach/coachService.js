// services/coach/coachService.js
const Coach = require("../../models/coach/coachModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");
const validateInputs = require("../../utils/validateInputs.util");

// Create (signup) - unverified coach
async function createUnverifiedCoach({ name, mobile, password, email }) {
  if (!validateInputs(name, mobile, password))
    throw new Error("Name/mobile/password required");

  // check existing mobile
  const exists = await Coach.findOne({ mobile });
  if (exists) throw new Error("Mobile already registered");

  const newCoach = new Coach({
    name: encrypt(name),
    mobile,
    password: encrypt(password),
    email: email ? encrypt(email) : "",
    status: "unverified",
    token: null,
    mobileVerified: false,
  });

  await newCoach.save();
  return newCoach;
}

// Verify OTP & set token
async function setTokenForCoachById(coachId) {
  const token = getId(12);
  const coach = await Coach.findByIdAndUpdate(
    coachId,
    { token },
    { new: true }
  );
  return { coach, token };
}

// Login
async function login(mobile, password) {
  const coach = await Coach.findOne({ mobile });
  if (!coach) return null;
  if (decrypt(coach.password) !== password) return null;

  const token = getId(12);
  coach.token = token;
  await coach.save();
  return { coach, token };
}

// Logout
async function logout(token) {
  const coach = await Coach.findOne({ token });
  if (!coach) return null;
  coach.token = null;
  await coach.save();
  return coach;
}

// get by id (public)
async function getCoachById(id) {
  const coach = await Coach.findById(id);
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
      // searching encrypted name isn't reliable; keep simple text matches only
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

// admin verify: change status
async function changeCoachStatus(id, status) {
  if (!["unverified", "semiverified", "verified"].includes(status)) {
    throw new Error("Invalid status");
  }
  const coach = await Coach.findById(id);
  if (!coach) return null;
  coach.status = status;
  coach.verified = status === "verified";
  await coach.save();
  return formatCoach(coach);
}

// upload certificates: push filenames
async function addCertificates(id, files) {
  const filenames = files.map((f) => f.filename || f.path || f);
  const updated = await Coach.findByIdAndUpdate(
    id,
    { $push: { certificates: { $each: filenames } } },
    { new: true }
  );
  return updated ? formatCoach(updated) : null;
}

// save agreement
async function saveAgreement(id, title, contentArr) {
  const formatted = {
    title,
    content: contentArr.map((i) => ({ type: i.type, content: i.content })),
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

  const catIndex = coach.category.findIndex((c) => c.id === categoryId);
  if (catIndex === -1) throw new Error("Category not found");

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

// helper: format coach for responses (decrypt text fields)
function formatCoach(doc) {
  const d = doc.toObject();
  delete d.password;
  return d;
}

// Set Profile Picture
async function setProfilePicture(id, filename) {
  return await Coach.findByIdAndUpdate(
    id,
    { profilePicture: filename },
    { new: true }
  );
}

// Set Work Images (max 3)
async function setWorkAssets(id, files) {
  const workImages = files.map((f) => ({
    type: f.mimetype.startsWith("image") ? "image" : "video",
    path: f.filename,
  }));
  return await Coach.findByIdAndUpdate(id, { workImages }, { new: true });
}

// Build / update coach profile
async function buildProfile(payload) {
  // Parse DOB from MM-DD-YYYY
  let [month, day, year] = payload.dob.split("-").map(Number);
  let dob = new Date(year, month - 1, day);

  const updatedCoach = await Coach.findOneAndUpdate(
    { token: decrypt(payload.token) },
    {
      email: encrypt(payload.email),
      dob,
      gender: encrypt(payload.gender),
      pinCode: encrypt(payload.pin_code),
      country: payload.country,
      city: encrypt(payload.city),
      address: encrypt(payload.address),
      experience_year: encrypt(payload.experience.year),
      experience_months: encrypt(payload.experience.months),
      category: payload.category.map((item) => ({
        id: item.id,
        coach_experties_level: item.coach_experties_level,
        session: item.session.map((s) => ({
          client_experties_level: s.client_experties_level,
          session_type: s.session_type,
          avg_time: s.avg_time,
          avg_price: s.avg_price,
          currency: s.currency,
          slots: s.slots || [],
        })),
      })),
      client_gender: payload.client_gender.map((g) => encrypt(g)),
      languages: payload.languages.map((l) => l._id),
      verified: false,
    },
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

module.exports = {
  createUnverifiedCoach,
  setTokenForCoachById,
  login,
  logout,
  getCoachById,
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
  buildProfile,
  deleteCoach,
  updatePassword,
};
