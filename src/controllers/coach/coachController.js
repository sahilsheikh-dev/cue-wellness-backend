const Coach = require("../../models/coach/coachModel");
const CoachUnverified = require("../../models/coach/coachUnVerifiedModel");
const CoachUnVerified2 = require("../../models/coach/coachUnVerifiedModel2")
const Languages = require("../../models/coach/language");
const Connection = require("../../models/coach/connection");
const ErrorModel = require("../../models/errorModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const validateInputs = require("../../utils/validateInputs.util");
const getId = require("../../utils/getId.util");
const { sendVerificationSms, checkVerification, generateLocalOTP } = require("../../services/coach/otpService");
const { getNextCode, incrementCode } = require("../../services/coach/codeService");
const { storeAssets } = require("../../services/coach/assetService");

/**
 * GET /
 */
const root = (req, res) => {
  return res.send("this is the auth section for the coaches");
};

/**
 * POST /signup
 */
const signup = async (req, res) => {
  try {
    const { name, contact, password } = req.body;
    if (!validateInputs(name, contact, password)) {
      return res.status(400).send({
                timestamp: new Date().toISOString(),
                message: "Please fill all the fields",
                erro:"Bad Request"
            });
    }

    const existing = await Coach.findOne({ mobile: contact });
    if (existing) {
      return res.status(409).send({
                message: "Mobile number already registered",
                timestamp: new Date().toISOString(),
                error: "Not Found"
            });
    }

    // generate OTP (use Twilio verify if configured, else local)
    let otp = generateLocalOTP(contact);
    if (process.env.TWILIO_VERIFY_SID && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      await sendVerificationSms(contact);
      // note: Twilio returns OTP server-side; you still store local OTP for fallback or verification mapping
    }

    const otpId = getId(12);
    const newCoach = new CoachUnverified({
      coach_id: await getNextCode("coach_unverified"),
      name: encrypt(name),
      mobile: contact,
      password: encrypt(password),
      otp: encrypt(otp),
      otpId,
    });

    await newCoach.save();
    await incrementCode("coach_unverified");

    return res.status(200).send({
                timestamp: new Date().toISOString(),
                message: "Account created successFully",
                data: { otpId: encrypt(otpId) }
            });
   } catch (err) {
    console.error("signup error:", err);
    const newErr = new ErrorModel({
      name: "user signup error",
      file: "controllers/coachAuthController.signup",
      description: "error during signup: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "low",
    });
    return res.status(500).send({
                timestamp: new Date().toISOString(),
                message: "Something went wrong",
                error: "Internal server error"
            });
  }
};

/**
 * POST /login
 */
const loginCoach = async (req, res) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.send({
        server: true,
        res: false,
        alert: "Please fill all the fields",
      });
    }

    // Helper function to attempt login in a given collection
    const tryLogin = async (Model, supply = null) => {
      const userData = await Model.findOne({ mobile: contact }).lean();
      if (!userData) return null;

      if (decrypt(userData.password) === password) {
        const newToken = getId(64); // generate a secure token
        await Model.updateOne(
          { _id: userData._id },
          { $set: { token: newToken } }
        );

        return {
          server: true,
          res: supply ? false : true,
          supply: supply || undefined,
          token: encrypt(newToken),
        };
      }

      return {
        server: true,
        res: false,
        alert: "Contact or password is incorrect",
      };
    };

    // Query 1: Coaches (fully verified)
    let result = await tryLogin(Coach);
    if (result) return res.send(result);

    // Query 2: CoachUnverified (half verified)
    result = await tryLogin(CoachUnverified, "1");
    if (result) return res.send(result);

    // Query 3: CoachUnverified2 (unverified)
    result = await tryLogin(CoachUnVerified2, "2");
    if (result) return res.send(result);

    // If no match found
    return res.send({
      server: true,
      res: false,
      alert: "Contact number or password is incorrect",
    });
  } catch (err) {
    console.error("Error in /login-coach:", err);
    const newErr = new ErrorModel({
      name: "login coach error",
      file: "src/controllers/coach/coachController/coachController.js",
      description: "error while coach login: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong while resending OTP",
            error:"Internal server error"
    });
  }
};

/**
 * POST /otp
 * body: { otp, otpId }
 */
const verifyOtp = async (req, res) => {
  try {
    const { otp, otpId } = req.body;
    if (!validateInputs(otp, otpId)) {
      return res.status(404).send({
            timestamp: new Date().toISOString(),
            message: "OTP or otpId missing",
            error: "Not found",
            });
    }

    const coach = await CoachUnverified.findOne({ otpId: decrypt(otpId) });
    if (!coach) {
      return res.status(404).send({
            timestamp: new Date().toISOString(),
            message: "Coach not found",
            error: "Not found",
            });
    }

    // If Twilio verify is configured, use it, else compare stored OTP
    let ok = false;
    if (process.env.TWILIO_VERIFY_SID && process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      ok = await checkVerification(coach.mobile, otp).catch(() => false);
    } else {
      ok = (otp === decrypt(coach.otp));
    }

    if (!ok) {
      return res.status(401).send({
            timestamp: new Date().toISOString(),
            message: "Incorrect OTP",
            error: "Unauthorized",
            });
    }

    const newToken = getId(12);
    await CoachUnverified.updateOne({ _id: coach._id }, { $set: { token: newToken, mobileVerified: true } });

    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "OTP verification successfull",
            data: { token: encrypt(newToken) }
            });
  } catch (err) {
    console.error("verifyOtp error:", err);
    const newErr = new ErrorModel({
      name: "coach otp section",
      file: "controllers/coachAuthController.verifyOtp",
      description: err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "medium",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong while resending OTP",
            error:"Internal server error"
            });
  }
};

/**
 * POST /resend-otp
 * body: { otpId }
 */
const resendOtp = async (req, res) => {
  try {
    const { otpId } = req.body;
    if (!validateInputs(otpId)) {
      return res.status(400).send({
            timestamp: new Date().toISOString(),
            message: "OTP Id is missing",
            error:"Not found"
            });
    }

    const user = await CoachUnverified.findOne({ otpId: decrypt(otpId) });
    if (!user) return res.status(400).send({
            timestamp: new Date().toISOString(),
            message: "User not found",
            error:"Not found"
            });
    const otp = generateLocalOTP(user.mobile);
    if (process.env.TWILIO_VERIFY_SID) {
      await sendVerificationSms(user.mobile);
    }

    await CoachUnverified.findByIdAndUpdate(user._id, { otp: encrypt(otp) });
    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "OTP re send successfully"
            });
  } catch (err) {
    console.error("resendOtp error:", err);
    const newErr = new ErrorModel({
      name: "resend error",
      file: "controllers/coachAuthController.resendOtp",
      description: err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "low",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong while resending OTP",
            error:"Internal server error"
            });
  }
};

/**
 * POST /build-profile
 * body: { token, dob, email, gender, pin_code, country, city, address, experience, category, languages, client_gender, ...}
 */
const buildProfile = async (req, res) => {
  try {
    const body = req.body;
    const required = [
      body.email, body.dob, body.gender, body.pin_code, body.country, body.city,
      body.address, body.experience, body.category, body.token, body.languages, body.client_gender
    ];
    if (!validateInputs(...required)) {
      return es.status(400).send({
            timestamp: new Date().toISOString(),
            message: "Please fill all the details",
            error:"Not found"
            });
    }

    const [month, day, year] = body.dob.split("-").map(Number);
    const dob = new Date(year, month - 1, day);

    const update = {
      email: encrypt(body.email),
      dob,
      gender: encrypt(body.gender),
      pinCode: encrypt(body.pin_code),
      country: body.country,
      city: encrypt(body.city),
      address: encrypt(body.address),
      experience_year: encrypt(body.experience.year),
      experience_months: encrypt(body.experience.months),
      category: body.category.map(item => ({ id: item.id, levelOfExpertise: item.clt })),
      client_gender: body.client_gender.map(item => encrypt(item)),
      languages: body.languages.map(item => item._id),
      get_verified: true
    };

    await CoachUnverified.findOneAndUpdate({ token: decrypt(body.token) }, update);
    return es.status(200).send({
            timestamp: new Date().toISOString(),
            message: "Coach profile build successfull"
            });
  } catch (err) {
    console.error("buildProfile error:", err);
    const newErr = new ErrorModel({
      name: "build coach profile",
      file: "controllers/coachAuthController.buildProfile",
      description: err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "low",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong while building coach profile",
            error:"Internal server error"
            });
  }
};

/**
 * POST /get-languages
 */
const getLanguages = async (req, res) => {
  try {
    const all = await Languages.find({});
    const decrypted = all.map(l => ({ ...l.toObject(), name: decrypt(l.name) }));
    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "Languages loaded successfully",
            data: decrypted,
            });
  } catch (err) {
    console.error("getLanguages error:", err);
    const newErr = new ErrorModel({
      name: "get connection error",
      file: "src/controllers/coach/coachController/coachController.js",
      description: "error while fetching languages: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong while loading languages",
            error:err.message
            });
  }
};

/**
 * POST /get-connections
 * body: { pass } expects pass === "cue_wellness_app"
 */
const getConnections = async (req, res) => {
  try {
    if (!validateInputs(req.body.pass) || req.body.pass !== "cue_wellness_app") {
      return res.status(403).send({
            timestamp: new Date().toISOString(),
            message: "You are not authorised to view this information",
            error: "Forbidden",
            });
    }
    const all = await Connection.find({ layer: 1 });
    const decrypted = all.map(c => ({ ...c.toObject(), title: decrypt(c.title) }));
    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "Connections loaded successfully",
            data: decrypted,
            });
  } catch (err) {
    console.error("getConnection error:", err);
    const newErr = new ErrorModel({
      name: "get connection error",
      file: "src/controllers/coach/coachController/coachController.js",
      description: "error while fetching connection: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong while loading connections",
            error:"Internal server error"
            });
  }
};

/**
 * POST /get-sub-connections
 * body: { pass, connection }
 */
const getSubConnections = async (req, res) => {
  try {
    if (!validateInputs(req.body.pass, req.body.connection) || req.body.pass !== "cue_wellness_app") {
      return res.status(403).send({
            timestamp: new Date().toISOString(),
            message: "You are not authorised to view this information",
            error: "Forbidden",
            });
    }
    const all = await Connection.find({ outer_id: req.body.connection });
    const decrypted = all.map(c => ({ ...c.toObject(), title: decrypt(c.title) }));
    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "Sub connections loaded successfully",
            data: decrypted,
            });
  } catch (err) {
    console.error("getSubConnection error:", err);
    const newErr = new ErrorModel({
      name: "get sub connection error",
      file: "src/controllers/coach/coachController/coachController.js",
      description: "error while fetching sub connection: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong while loading sub connections",
            error:"Internal server error"
            });
  }
};

/**
 * POST /save-certificates
 * header: authorization (encrypted token)
 * body: multipart/form-data images
 */
/*const saveCertificates = async (req, res) => {
  try {
    const tokenHeader = req.headers["authorization"];
    if (!tokenHeader) return res.status(401).send({
            timestamp: new Date().toISOString(),
            message: "Token header not found",
            error:"Unauthorized"
            });
    const token = decrypt(tokenHeader);
    const coach = await CoachUnverified.findOne({ token });
    if (!coach) return res.status(401).send({
            timestamp: new Date().toISOString(),
            message: "Coach not found",
            error:"Unauthorized"
            });

    const all_certi = (req.files || []).map(f => f.filename);
    await CoachUnverified.findByIdAndUpdate(coach._id, { $push: { certificates: { $each: all_certi } } });

    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "Certificate saved successfully",
            data: { uploaded: all_certi },
            });
  } catch (err) {
    console.error("saveCertificates error:", err);
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong",
            error:"Internal server error"
            });
  }
};*/

/**
 * POST /save_agreement
 * body: { token, title, content }
 */
const saveAgreement = async (req, res) => {
  try {
    const token = decrypt(req.body.token);
    const coach = await CoachUnverified.findOne({ token });
    if (!coach) return res.status(401).send({
            timestamp: new Date().toISOString(),
            message: "Coach not found",
            error:"Unauthorized"
            });

    if (!validateInputs(req.body.title, req.body.content)) {
      return res.status(422).send({
            timestamp: new Date().toISOString(),
            message: "Please fill all the details",
            error:"Unprocessable Entity"
            });
    }

    const contentEncrypted = req.body.content.map(item => ({ type: encrypt(item.type), content: encrypt(item.content) }));
    await CoachUnverified.findByIdAndUpdate(co._id, { agreement_terms: { title: encrypt(req.body.title), content: contentEncrypted } });

    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "Agreement saved"
            });
  } catch (err) {
    console.error("saveAgreement error:", err);
    const newErr = new ErrorModel({
      name: "save agreement error",
      file: "src/controllers/coach/coachController/coachController.js",
      description: "error during saving agreement: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong",
            error:"Internal server error"
            });
  }
};

const deleteCoach = async (req, res) => {
  try {
    const token = decrypt(req.body.token); // decrypt the coach token
    const coach = await Coach.findOne({ token });

    if (!coach) {
      return res.status(400).send({
            timestamp: new Date().toISOString(),
            message: "Coach not found",
            error:"Not found"
            });
    }

    await Coach.findByIdAndDelete(coach._id);
    return res.status(200).send({
            timestamp: new Date().toISOString(),
            message: "Coach deleted successfully"
            });
  } catch (err) {
    console.error("deleteCoach error:", err);
    const newErr = new ErrorModel({
      name: "delete coach error",
      file: "src/controllers/coach/coachController/coachController.js",
      description: "error during coach delete: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    return res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong",
            erro:"Intenral server error"
            });
  }
};

const uploadAssets = async (req, res) => {
  try {
    const { flag } = req.body;
    const token = decrypt(req.body.token); // decrypt the coach token
    const coach = await Coach.findOne({ token });

    if (!flag) return res.status(400).json({ success: false, message: "Flag is required" });
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({
            timestamp: new Date().toISOString(),
            message: "No files Uploaded",
            error:"Not found"
            });
    }

    // Use service to prepare asset response
    const assets = storeAssets(coach._id, req.files, flag);

    // Save paths in coach model depending on flag
    if (flag === "profilePicture") {
      coach.profilePicture = assets[0].complete_path;
    } else if (flag === "certificates") {
      coach.workImage.push({ type: "certificate", path: assets[0].complete_path });
    } else if (flag === "serviceImages") {
      assets.forEach(a => coach.workImage.push({ type: "serviceImage", path: a.complete_path }));
    } else if (flag === "serviceVideos") {
      assets.forEach(a => coach.workImage.push({ type: "serviceVideo", path: a.complete_path }));
    }

    await coach.save();

    res.json({ success: true, data: assets });
  } catch (error) {
    console.error("Upload error:", error);
    const newErr = new ErrorModel({
      name: "upload asset error",
      file: "src/controllers/coach/coachController/coachController.js",
      description: "error during asset upload: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    res.status(500).send({
            timestamp: new Date().toISOString(),
            message: "Something went wrong",
            erro:"Intenral server error"
            });
  }
};

module.exports = { uploadAssets };



module.exports = {
    root,
    signup,
    loginCoach,
    verifyOtp,
    resendOtp,
    buildProfile,
    getLanguages,
    getConnections,
    getSubConnections,
    saveAgreement,
    deleteCoach,
};
