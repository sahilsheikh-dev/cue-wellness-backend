const mongoose = require("mongoose");
const ChatSchema = new mongoose.Schema({
  chat_id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  coach_id: {
    type: String,
    required: true,
  },
  last_message_number: {
    type: Number,
    required: false,
  },
  last_message_text: {
    type: String,
    required: false,
  },
  last_message_time: {
    type: Date,
    required: true,
    default: Date.now(),
  },

  unread: {
    type: Number,
    required: true,
    default: false,
  },
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;
