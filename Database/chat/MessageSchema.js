const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema({
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
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
