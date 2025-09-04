const mongoose = require("mongoose");
const EventManagementChatSchema = new mongoose.Schema({
  chat_id: {
    type: String,
    required: true,
  },
  user_id: {
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
  //   the next 2 are how many messages are unread by the client and management
  unread_by_user: {
    type: Number,
    required: true,
  },
  unread_by_management: {
    type: Number,
    required: true,
  },
});

const EventManagementChat = mongoose.model(
  "EventManagementChat",
  EventManagementChatSchema
);
module.exports = EventManagementChat;
