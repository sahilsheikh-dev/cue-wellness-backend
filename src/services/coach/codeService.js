const Numbers = require("../models/Numbers");

/**
 * Return next code string based on entity (client, coach, coach_unverified, ...).
 * Uses Numbers collection to build a padded number part.
 */
async function getNextCode(entity) {
  const mapping = {
    client: "client",
    coach: "coach",
    coach_unverified: "coach_unverified",
    management: "management",
    staff: "staff",
    eo: "event",
    pc: "product",
  };
  const name = mapping[entity] || entity;
  const numData = await Numbers.findOne({ name });
  const n = (numData && typeof numData.number === "number") ? numData.number + 1 : 1;
  const numString = n < 10 ? `00${n}` : (n < 100 ? `0${n}` : `${n}`);
  const prefix = {
    client: "CL",
    coach: "CO",
    coach_unverified: "COUV",
    management: "MNGT",
    staff: "ST",
    eo: "EO",
    pc: "PC",
  }[entity] || entity.toUpperCase();

  return `${prefix}-${numString}-${new Date().getFullYear()}`;
}

async function incrementCode(entity) {
  const mapping = {
    client: "client",
    coach: "coach",
    coach_unverified: "coach_unverified",
    management: "management",
    staff: "staff",
    eo: "event",
    pc: "product",
  };
  const name = mapping[entity] || entity;
  const numData = await Numbers.findOne({ name });
  if (!numData) throw new Error(`Numbers entry not found for ${name}`);
  await Numbers.findByIdAndUpdate(numData._id, { number: numData.number + 1 });
}

module.exports = { getNextCode, incrementCode };
