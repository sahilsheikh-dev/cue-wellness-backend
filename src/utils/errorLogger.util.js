const ErrorModel = require("../models/errorModel");

/**
 * logError - writes an error document to DB, safely.
 * @param {Object} opts
 *  - name: short name (e.g. 'send otp')
 *  - file: source file path
 *  - description: string or error.message
 *  - stack: error.stack (optional)
 *  - section: logical area (e.g. 'otp')
 *  - priority: 'low' | 'medium' | 'high' (default 'medium')
 */
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
    // If logging fails, avoid throwing; output minimal server console message
    // Do NOT include sensitive values.
    console.error(
      "Failed to write error log:",
      err && err.message ? err.message : err
    );
  }
}

module.exports = { logError };
