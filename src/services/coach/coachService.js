const Coach = require("../../models/coach/coachModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");
const validateInputs = require("../../utils/validateInputs.util");
const path = require("path");
const fs = require("fs");
const { hashPassword, comparePassword } = require("../../utils/password.util");
const { logError } = require("../../utils/errorLogger.util");
const {
  signAccessToken,
  generateRefreshTokenPlain,
  hashRefreshToken,
  refreshTokenExpiryDate,
} = require("../../utils/jwt.util");

const {
  UPLOADS_BASE_PATH = path.join(process.cwd(), "uploads"),
  PROFILE_PIC_PATH = "profile_pics",
  CERTIFICATES_PATH = "certificates",
  WORK_ASSETS_PATH = "work_assets",
  SERVER_BASE_URL,
  PORT = 9000,
} = process.env;

const BASE_URL = SERVER_BASE_URL || `http://localhost:${PORT}`;

function logWarn(prefix, filePath, err) {
  console.warn(
    prefix,
    filePath,
    process.env.NODE_ENV === "development" ? err.stack : err.message
  );
}

function publicUrlFor(relative) {
  if (!relative) return relative;
  if (/^https?:\/\//i.test(relative)) return relative;
  return `${BASE_URL}/uploads/${relative.replace(/^[\/\\]+/, "")}`;
}

/**
 * Create an unverified coach
 * - password is hashed
 */

async function createUnverifiedCoach({
  name,
  password,
  mobile,
  mobileVerified,
  agree_terms_conditions,
  agree_privacy_policy,
}) {
  const exists = await Coach.findOne({ mobile });
  if (exists) throw new Error("Mobile number already registered");

  const hashed = await hashPassword(password);
  // still keep legacy token for backward compat, but the new flow uses JWT + refresh tokens
  const legacyToken = getId(24);

  const newCoach = new Coach({
    name,
    mobile,
    password: hashed,
    mobileVerified: !!mobileVerified,
    agree_terms_conditions,
    agree_privacy_policy,
    token: legacyToken,
    status: "unverified",
  });

  await newCoach.save();
  return formatCoach(newCoach);
}

async function processOtpVerification(otpRecord, reqMeta = {}) {
  if (!otpRecord)
    return { accessToken: null, refreshTokenPlain: null, coach: null };

  let coach = null;
  if (otpRecord.meta && otpRecord.meta.coachId) {
    coach = await Coach.findById(otpRecord.meta.coachId);
  } else if (otpRecord.phone) {
    coach = await Coach.findOne({ mobile: otpRecord.phone });
  }

  if (!coach)
    return { accessToken: null, refreshTokenPlain: null, coach: null };

  // mark verified and update legacy token
  coach.mobileVerified = true;
  if (coach.status === "unverified") coach.status = "pending";
  const legacyToken = getId(24);
  coach.token = legacyToken;
  await coach.save();

  // issue tokens
  const accessToken = signAccessToken({
    sub: String(coach._id),
    role: "coach",
  });
  const refreshPlain = generateRefreshTokenPlain();
  await saveRefreshToken(coach._id, refreshPlain, reqMeta);

  return {
    accessToken,
    refreshTokenPlain: refreshPlain,
    coach: formatCoach(coach),
  };
}

/**
 * Login - validate password, issue tokens
 */
async function login(mobile, password, reqMeta = {}) {
  const coach = await Coach.findOne({ mobile });
  if (!coach) return null;
  const ok = await comparePassword(password, coach.password);
  if (!ok) return null;

  // update legacy token for compatibility
  coach.token = getId(24);
  await coach.save();

  // issue tokens
  const accessToken = signAccessToken({
    sub: String(coach._id),
    role: "coach",
  });
  const refreshPlain = generateRefreshTokenPlain();
  await saveRefreshToken(coach._id, refreshPlain, reqMeta);

  return {
    coach: formatCoach(coach),
    accessToken,
    refreshTokenPlain: refreshPlain,
  };
}

/**
 * Logout - revoke refresh token (if provided) or clear cookie
 */
async function logout(refreshTokenPlain, coachId = null) {
  // if coachId provided and no refresh token, clear all
  if (coachId && !refreshTokenPlain) {
    await clearAllRefreshTokens(coachId);
    return true;
  }

  if (!refreshTokenPlain) return false;
  // try to find coach owning this refresh token and remove it
  const tokenHash = hashRefreshToken(refreshTokenPlain);
  const coach = await Coach.findOne({ "refreshTokens.tokenHash": tokenHash });
  if (!coach) return false;
  // remove token
  coach.refreshTokens = (coach.refreshTokens || []).filter(
    (t) => t.tokenHash !== tokenHash
  );
  await coach.save();
  return true;
}

async function getCoachById(id) {
  const coach = await Coach.findById(id);
  return coach ? formatCoach(coach) : null;
}

/**
 * When client sends refresh token, verify and rotate (if valid) and issue new access token.
 * Returns { accessToken, refreshTokenPlain (if rotated), coach } or invalid reasons.
 */
async function refreshAccessToken(refreshTokenPlain, reqMeta = {}) {
  const verified = await verifyAndRotateRefreshToken(
    refreshTokenPlain,
    true,
    reqMeta
  );
  if (!verified.valid)
    return { ok: false, reason: verified.reason || "invalid" };

  const coachPayload = verified.coach;
  const coachId = coachPayload._id;
  const accessToken = signAccessToken({ sub: String(coachId), role: "coach" });

  return {
    ok: true,
    accessToken,
    refreshTokenPlain: verified.newRefreshPlain, // rotated token plain
    coach: coachPayload,
  };
}

async function setTokenForCoachById(coachId) {
  const token = getId(24);
  const updated = await Coach.findByIdAndUpdate(
    coachId,
    { token },
    { new: true }
  );
  return { coach: updated ? formatCoach(updated) : null, token };
}

async function getCoachByToken(token) {
  if (!token) return null;
  const coach = await Coach.findOne({ token });
  return coach ? formatCoach(coach) : null;
}

async function listCoaches({ page = 1, limit = 20, status, q } = {}) {
  const skip = (page - 1) * limit;
  const filter = {};
  if (status) filter.status = status;
  if (q)
    filter.$or = [
      { mobile: { $regex: q, $options: "i" } },
      { name: { $regex: q, $options: "i" } },
    ];
  const docs = await Coach.find(filter).skip(skip).limit(limit);
  return docs.map(formatCoach);
}

async function updateCoach(id, data) {
  const update = { ...data };
  if (data.password) update.password = await hashPassword(data.password);
  delete update.token;
  const updated = await Coach.findByIdAndUpdate(id, update, { new: true });
  return updated ? formatCoach(updated) : null;
}

async function coachProfileSetupService(payload) {
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
  return updatedCoach ? formatCoach(updatedCoach) : null;
}

async function saveStoryService(payload) {
  const coach = await Coach.findOneAndUpdate(
    { _id: payload.id },
    { $set: { story: payload.story } },
    { new: true }
  );
  return coach ? formatCoach(coach) : null;
}

async function coachAgreementTermsService(payload) {
  const coach = await Coach.findByIdAndUpdate(
    payload.id,
    { $set: { agreement_terms: payload.agreement_terms } },
    { new: true }
  ).lean();
  return coach;
}

async function changeCoachStatus(id, status) {
  if (!["unverified", "pending", "verified"].includes(status))
    throw new Error("Invalid status");
  const coach = await Coach.findById(id);
  if (!coach) return null;
  coach.status = status;
  coach.verified = status === "verified";
  await coach.save();
  return formatCoach(coach);
}

async function toggleBlockStatus(id, isBlocked) {
  const coach = await Coach.findById(id);
  if (!coach) return null;
  coach.isBlocked = !!isBlocked;
  await coach.save();
  return formatCoach(coach);
}

async function addCertificates(coachId, indexes, files) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;
  for (let i = 0; i < indexes.length; i++) {
    const idx = indexes[i];
    const file = files[i];
    const certPathRelative = file
      ? `${CERTIFICATES_PATH}/${file.filename}`
      : null;
    const publicPath = certPathRelative ? publicUrlFor(certPathRelative) : null;
    const existingIdx = coach.certificates.findIndex((c) => c.index === idx);
    if (publicPath) {
      if (existingIdx !== -1) coach.certificates[existingIdx].path = publicPath;
      else coach.certificates.push({ index: idx, path: publicPath });
    } else {
      if (existingIdx !== -1) {
        const oldUrl = coach.certificates[existingIdx].path || "";
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
        coach.certificates.splice(existingIdx, 1);
      }
    }
  }
  await coach.save();
  return formatCoach(coach);
}

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

async function saveSessionSlots(id, categoryId, sessionKey, level, payload) {
  const coach = await Coach.findById(id);
  if (!coach) return null;
  coach.category = coach.category || [];
  const catIndex = coach.category.findIndex((c) => c.id === categoryId);
  if (catIndex === -1) throw new Error("Category not found");
  coach.category[catIndex].levelOfExpertise =
    coach.category[catIndex].levelOfExpertise || [];
  if (!coach.category[catIndex].levelOfExpertise.includes(level))
    coach.category[catIndex].levelOfExpertise.push(level);
  coach.category[catIndex].session = coach.category[catIndex].session || {};
  coach.category[catIndex].session[sessionKey] = payload;
  await coach.save();
  return formatCoach(coach);
}

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

async function setProfilePicture(id, fullFilePath) {
  const coach = await Coach.findById(id);
  if (!coach) return null;
  if (coach.profilePicture) {
    const oldFilename = coach.profilePicture.split("/").pop();
    const oldFilePath = path.join(
      UPLOADS_BASE_PATH,
      PROFILE_PIC_PATH,
      oldFilename
    );
    try {
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    } catch (err) {
      logWarn("Old profile picture not deleted:", oldFilePath, err);
    }
  }
  const relative = `${PROFILE_PIC_PATH}/${path.basename(fullFilePath)}`;
  coach.profilePicture = relative;
  await coach.save();
  return formatCoach(coach);
}

async function setWorkAssets(coachId, indexes, files) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;
  for (let i = 0; i < indexes.length; i++) {
    const idx = indexes[i];
    const file = files[i];
    const existingAsset = coach.workAssets.find((w) => w.index === idx);
    if (file) {
      const type = file.mimetype.startsWith("image") ? "image" : "video";
      const relative = `${WORK_ASSETS_PATH}/${file.filename}`;
      if (existingAsset) {
        const oldFilename = (existingAsset.path || "").split("/").pop();
        const oldFilePath = path.join(
          UPLOADS_BASE_PATH,
          WORK_ASSETS_PATH,
          oldFilename
        );
        try {
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (err) {
          logWarn("Old work asset not deleted:", oldFilePath, err);
        }
        existingAsset.path = relative;
        existingAsset.type = type;
      } else {
        coach.workAssets.push({ index: idx, path: relative, type });
      }
    } else if (existingAsset) {
      const oldFilename = existingAsset.path.split("/").pop();
      const oldFilePath = path.join(
        UPLOADS_BASE_PATH,
        WORK_ASSETS_PATH,
        oldFilename
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

async function buildProfile(payload) {
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
    email: payload.email,
    dob,
    gender: payload.gender,
    pinCode: payload.pin_code,
    country: payload.country,
    city: payload.city,
    address: payload.address,
    experience_year: payload.experience?.year,
    experience_months: payload.experience?.months,
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
    client_gender: payload.client_gender || [],
    languages: payload.languages || [],
    verified: false,
  };
  const updatedCoach = await Coach.findOneAndUpdate(
    { token: tokenDecrypted },
    updateObj,
    { new: true }
  );
  return updatedCoach ? formatCoach(updatedCoach) : null;
}

async function deleteCoach(coachId) {
  const deletedCoach = await Coach.findByIdAndDelete(coachId);
  return deletedCoach ? formatCoach(deletedCoach) : null;
}

async function updatePassword(coachId, oldPassword, newPassword) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;
  const ok = await comparePassword(oldPassword, coach.password);
  if (!ok) return { error: "Old password is incorrect" };
  coach.password = await hashPassword(newPassword);
  await coach.save();
  return formatCoach(coach);
}

async function forgetPasswordService(mobile, newPassword) {
  if (!mobile) throw new Error("Mobile required");
  const coach = await Coach.findOne({ mobile });
  if (!coach) return null;
  coach.password = await hashPassword(newPassword);
  await coach.save();
  return formatCoach(coach);
}

async function isMobileAvailable(mobile) {
  if (!mobile) throw new Error("Mobile required");
  const coach = await Coach.findOne({ mobile });
  return !coach;
}

function formatCoach(doc) {
  if (!doc) return null;
  const d = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));
  delete d.password;
  // Do not return hashed refresh tokens
  if (d.refreshTokens) delete d.refreshTokens;
  if (d.profilePicture && d.profilePicture.indexOf(BASE_URL) === -1)
    d.profilePicture = publicUrlFor(d.profilePicture);
  if (Array.isArray(d.certificates)) {
    d.certificates = d.certificates.map((c) => ({
      ...c,
      path: publicUrlFor(c.path),
    }));
  }
  if (Array.isArray(d.workAssets)) {
    d.workAssets = d.workAssets.map((w) => ({
      ...w,
      path: publicUrlFor(w.path),
    }));
  }
  return d;
}

/* ---------------------------
   Token helpers
   --------------------------- */

/**
 * Save a refresh token hashed to coach.refreshTokens array
 * returns saved metadata
 */
async function saveRefreshToken(coachId, refreshTokenPlain, reqMeta = {}) {
  const tokenHash = hashRefreshToken(refreshTokenPlain);
  const expiresAt = refreshTokenExpiryDate();
  const coach = await Coach.findById(coachId);
  if (!coach) return null;
  coach.refreshTokens = coach.refreshTokens || [];
  coach.refreshTokens.push({
    tokenHash,
    expiresAt,
    createdAt: new Date(),
    userAgent: reqMeta.userAgent || null,
    ip: reqMeta.ip || null,
  });
  await coach.save();
  return { tokenHash, expiresAt };
}

/**
 * Remove a refresh token (by plain token) from DB (logout / revoke)
 */
async function revokeRefreshToken(coachId, refreshTokenPlain) {
  const tokenHash = hashRefreshToken(refreshTokenPlain);
  const res = await Coach.findByIdAndUpdate(
    coachId,
    { $pull: { refreshTokens: { tokenHash } } },
    { new: true }
  );
  return res ? true : false;
}

/**
 * Verify a refresh token plain and return the coach if valid.
 * Optionally rotates (removes old token and inserts new one) if rotate === true.
 * Returns { coach, newRefreshTokenPlain } where newRefreshTokenPlain is present if rotation happened.
 */
async function verifyAndRotateRefreshToken(
  refreshTokenPlain,
  rotate = true,
  reqMeta = {}
) {
  const tokenHash = hashRefreshToken(refreshTokenPlain);
  // find coach containing this token and that token is not expired
  const now = new Date();
  const coach = await Coach.findOne({ "refreshTokens.tokenHash": tokenHash });
  if (!coach) return { valid: false, reason: "not_found" };

  const matched = (coach.refreshTokens || []).find(
    (t) => t.tokenHash === tokenHash
  );
  if (!matched) return { valid: false, reason: "not_found" };
  if (matched.expiresAt && matched.expiresAt < now) {
    // expired - remove it
    await Coach.findByIdAndUpdate(coach._id, {
      $pull: { refreshTokens: { tokenHash } },
    });
    return { valid: false, reason: "expired" };
  }

  // valid; optionally rotate
  let newRefreshPlain = null;
  if (rotate) {
    // remove old token and add a new one
    const newPlain = generateRefreshTokenPlain();
    const newHash = hashRefreshToken(newPlain);
    const expiresAt = refreshTokenExpiryDate();

    // atomic-ish: remove old token and push new one
    await Coach.findByIdAndUpdate(coach._id, {
      $pull: { refreshTokens: { tokenHash } },
    });

    await Coach.findByIdAndUpdate(coach._id, {
      $push: {
        refreshTokens: {
          tokenHash: newHash,
          expiresAt,
          createdAt: new Date(),
          userAgent: reqMeta.userAgent || null,
          ip: reqMeta.ip || null,
        },
      },
    });

    newRefreshPlain = newPlain;
  }

  return { valid: true, coach: formatCoach(coach), newRefreshPlain };
}

/**
 * Clear all refresh tokens for a coach (used in logout-all)
 */
async function clearAllRefreshTokens(coachId) {
  await Coach.findByIdAndUpdate(coachId, { $set: { refreshTokens: [] } });
}

async function setProfilePicture(id, fullFilePath) {
  const coach = await Coach.findById(id);
  if (!coach) return null;

  // Delete old one if ours
  if (coach.profilePicture) {
    const oldFilename = coach.profilePicture.split("/").pop();
    const oldFilePath = path.join(
      UPLOADS_BASE_PATH,
      PROFILE_PIC_PATH,
      oldFilename
    );
    try {
      if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
    } catch (err) {
      logWarn("Old profile picture not deleted:", oldFilePath, err);
    }
  }

  const relative = `${PROFILE_PIC_PATH}/${path.basename(fullFilePath)}`;
  coach.profilePicture = relative;
  await coach.save();
  return formatCoach(coach);
}

async function setWorkAssets(coachId, indexes, files) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;

  for (let i = 0; i < indexes.length; i++) {
    const idx = indexes[i];
    const file = files[i];
    const existingAsset = coach.workAssets.find((w) => w.index === idx);

    if (file) {
      const type = file.mimetype.startsWith("image") ? "image" : "video";
      const relative = `${WORK_ASSETS_PATH}/${file.filename}`;
      const publicPath = publicUrlFor(relative);

      if (existingAsset) {
        // delete old file
        const oldFilename = (existingAsset.path || "").split("/").pop();
        const oldFilePath = path.join(
          UPLOADS_BASE_PATH,
          WORK_ASSETS_PATH,
          oldFilename
        );
        try {
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (err) {
          logWarn("Old work asset not deleted:", oldFilePath, err);
        }
        existingAsset.path = relative;
        existingAsset.type = type;
      } else {
        coach.workAssets.push({ index: idx, path: relative, type });
      }
    } else if (existingAsset) {
      const oldFilename = existingAsset.path.split("/").pop();
      const oldFilePath = path.join(
        UPLOADS_BASE_PATH,
        WORK_ASSETS_PATH,
        oldFilename
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

async function buildProfile(payload) {
  // Parse DOB if provided as MM-DD-YYYY
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
    email: payload.email,
    dob,
    gender: payload.gender,
    pinCode: payload.pin_code,
    country: payload.country,
    city: payload.city,
    address: payload.address,
    experience_year: payload.experience?.year,
    experience_months: payload.experience?.months,
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
    client_gender: payload.client_gender || [],
    languages: payload.languages || [],
    verified: false,
  };

  const updatedCoach = await Coach.findOneAndUpdate(
    { token: tokenDecrypted },
    updateObj,
    { new: true }
  );
  return updatedCoach ? formatCoach(updatedCoach) : null;
}

async function deleteCoach(coachId) {
  const deletedCoach = await Coach.findByIdAndDelete(coachId);
  return deletedCoach ? formatCoach(deletedCoach) : null;
}

async function updatePassword(coachId, oldPassword, newPassword) {
  const coach = await Coach.findById(coachId);
  if (!coach) return null;
  const ok = await comparePassword(oldPassword, coach.password);
  if (!ok) return { error: "Old password is incorrect" };
  coach.password = await hashPassword(newPassword);
  await coach.save();
  return formatCoach(coach);
}

async function forgetPasswordService(mobile, newPassword) {
  if (!mobile) throw new Error("Mobile required");
  const coach = await Coach.findOne({ mobile });
  if (!coach) return null;
  coach.password = await hashPassword(newPassword);
  await coach.save();
  return formatCoach(coach);
}

async function isMobileAvailable(mobile) {
  if (!mobile) throw new Error("Mobile required");
  const coach = await Coach.findOne({ mobile });
  return !coach;
}

module.exports = {
  saveRefreshToken,
  revokeRefreshToken,
  verifyAndRotateRefreshToken,
  createUnverifiedCoach,
  processOtpVerification,
  setTokenForCoachById,
  login,
  logout,
  refreshAccessToken,
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
