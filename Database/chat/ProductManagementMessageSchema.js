const mongoose = require("mongoose");
const ProductManagementMessageSchema = new mongoose.Schema({
  chat_id: {
    type: String,
    required: true,
  },
  content_type: {
    type: String,
    required: true,
  },
  send_by: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  send_at: {
    type: Date,
    default: Date.now,
  },
  message_number: {
    type: Number,
    required: true,
  },
  staff_id: {
    type: String,
    required: true,
  },
});

const ProductManagementMessage = mongoose.model(
  "ProductManagementMessage",
  ProductManagementMessageSchema
);
module.exports = ProductManagementMessage;
