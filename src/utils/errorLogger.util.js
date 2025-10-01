const ErrorModel = require("../models/errorModel");

async function logError({
  name = "error",
  file = "unknown",
  description = "",
  stack,
  section = "general",
  priority = "medium",
}) {
  try {
    const doc = new ErrorModel({
      name,
      file,
      description: String(description).slice(0, 2000),
      stack: stack ? String(stack).slice(0, 2000) : undefined,
      dateTime: new Date(),
      section,
      priority,
    });
    await doc.save();
  } catch (err) {
    // Keep noise minimal in production; only console.warn so app continues
    console.warn(
      "Failed to write error log:",
      err && err.message ? err.message : err
    );
  }
}

module.exports = { logError };
