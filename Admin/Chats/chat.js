const chat = require("express").Router();
const ClientManagementChat = require("../../Database/chat/ClientManagementChatSchema");
const ClientManagementMessage = require("../../Database/chat/ClientManagementMessageSchema");
const CoachManagementChat = require("../../Database/chat/CoachManagementChatSchema");
const CoachManagementMessage = require("../../Database/chat/CoachManagementMessageSchema");
const EventManagementChat = require("../../Database/chat/EventManagementChatSchema");
const EventManagementMessage = require("../../Database/chat/EventManagementMessageSchema");
const ProductManagementChat = require("../../Database/chat/ProductManagementChatSchema");
const ProductManagementMessage = require("../../Database/chat/ProductManagementMessageSchema");
const VerifyToken = require("../Auth/VerifyToken");
const VerifyTokenFull = require("../Auth/VerifyTokenFull");
const User = require("../../Database/user/userSchema");
const { encrypt, decrypt } = require("../../essentials/cryptography");

chat.post("/get-client-chats", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await ClientManagementChat.find({}).then(async (client_chat_data) => {
        const enrichedData = await Promise.all(
          client_chat_data.map(async (chat) => {
            // Assuming chat.user_id holds the reference to the user
            const user = await User.findById(chat.user_id);

            return {
              ...chat._doc, // spread the chat document
              name: decrypt(user.name),
              profile_image: user.profilePicture,
            };
          })
        );
        res.send({ server: true, res: true, supply: enrichedData });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

chat.post("/get-coach-chats", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await CoachManagementChat.find({}).then((coach_chat_data) => {
        res.send({ server: true, res: true, supply: coach_chat_data });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

chat.post("/get-event-chats", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await EventManagementChat.find({}).then((event_chat_data) => {
        res.send({ server: true, res: true, supply: event_chat_data });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

chat.post("/get-product-chats", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await ProductManagementChat.find({}).then((product_chat_data) => {
        res.send({ server: true, res: true, supply: product_chat_data });
      });
    })
    .catch(() => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

chat.post("/get-client-indi-chats", (req, res) => {
  VerifyToken(req.cookies.AuthToken)
    .then(async () => {
      await ClientManagementMessage.find({ chat_id: req.body.chat_id }).then(
        (indi_chats) => {
          res.send({ server: true, res: true, supply: indi_chats });
        }
      );
    })
    .catch((err) => {
      //   console.log(err);
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

chat.post("/client-text-reply", (req, res) => {
  console.log(req.body);
  VerifyTokenFull(req.cookies.AuthToken)
    .then(async (admin) => {
      ClientManagementChat.findOne({ chat_id: req.body.chat_id }).then(
        async (chat_data) => {
          await ClientManagementChat.findByIdAndUpdate(chat_data._id, {
            last_message_number: chat_data.last_message_number + 1,
            last_message_text: req.body.text,
            last_message_time: Date.now(),
            unread_by_user: chat_data.unread_by_user + 1,
            unread_by_management: chat_data.unread_by_management + 1,
          });
          let new_msg = new ClientManagementMessage({
            chat_id: req.body.chat_id,
            content_type: "text",
            send_by: "management",
            content: req.body.text,
            message_number: chat_data.last_message_number + 1,
            staff_id: admin._id,
            user_id: chat_data.user_id,
          });

          await new_msg.save();
          res.send({ server: true, res: true });
        }
      );
    })
    .catch((err) => {
      res.send({ server: true, res: false, redirect: "/login" });
    });
});

module.exports = chat;
