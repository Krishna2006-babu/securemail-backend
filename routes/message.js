/**
 * message.js
 * Handles all message-related routes:
 * - Send message
 * - Inbox (received messages)
 * - Sent messages
 * - Mark message as read
 */

const express = require("express");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const Message = require("../models/Message");
const authenticateToken = require("../middleware/auth");
const { messageLimiter } = require("../middleware/rateLimiter");
const { sendMessageValidator } = require("../validators/messageValidator");

const router = express.Router();

/* =====================================================
   SEND MESSAGE (Day 9 – Sanitized & Rate Limited)
   ===================================================== */
router.post(
  "/send",
  authenticateToken,        // 1️⃣ JWT authentication
  messageLimiter,           // 2️⃣ Rate limiting (anti-spam)
  sendMessageValidator,     // 3️⃣ Validation & sanitization
  async (req, res) => {
    try {
      /* ---------- HANDLE VALIDATION ERRORS ---------- */
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      /* ---------- BUSINESS LOGIC ---------- */
      const senderId = req.user.id;
      const { receiverId, content } = req.body;

      // Validate receiver ObjectId
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid receiver ID"
        });
      }

      // Prevent self-messaging
      if (senderId === receiverId) {
        return res.status(400).json({
          success: false,
          message: "You cannot send a message to yourself"
        });
      }

      /* ---------- CREATE MESSAGE ---------- */
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content // already trimmed & escaped by validator
      });

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send message",
        error: error.message
      });
    }
  }
);

/* =====================================================
   INBOX (RECEIVED MESSAGES) WITH PAGINATION
   ===================================================== */
router.get("/inbox", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch messages where logged-in user is receiver
    const inboxMessages = await Message.find({
      receiver: userId
    })
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Inbox fetched successfully",
      page,
      limit,
      count: inboxMessages.length,
      data: inboxMessages
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inbox",
      error: error.message
    });
  }
});

/* =====================================================
   SENT MESSAGES WITH PAGINATION
   ===================================================== */
router.get("/sent", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sentMessages = await Message.find({
      sender: userId
    })
      .populate("receiver", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Sent messages fetched successfully",
      page,
      limit,
      count: sentMessages.length,
      data: sentMessages
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sent messages",
      error: error.message
    });
  }
});

/* =====================================================
   MARK MESSAGE AS READ
   ===================================================== */
router.patch("/read/:messageId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    // Validate message ID
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID"
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to mark this message as read"
      });
    }

    if (message.read) {
      return res.status(400).json({
        success: false,
        message: "Message already marked as read"
      });
    }

    message.read = true;
    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: message
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update read status",
      error: error.message
    });
  }
});

module.exports = router;
