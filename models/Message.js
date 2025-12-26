/**
 * Message.js
 * Defines the Message schema
 */

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true
    },

    // Who receives the message
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Actual message content
    content: {
      type: String,
      required: true,
      trim: true
    },

    // Read status (for future use)
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Message", messageSchema);
