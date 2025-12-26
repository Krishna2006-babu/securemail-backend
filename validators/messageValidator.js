/**
 * messageValidator.js
 * Handles validation & sanitization for message APIs
 */

const { body } = require("express-validator");

const sendMessageValidator = [
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID is required"),

  body("content")
    .trim() //Removes leading & trailing spaces.
    .notEmpty()//Prevents empty messages.
    .withMessage("Message content cannot be empty")
    .isLength({ max: 500 })//Stops message flooding.
    .withMessage("Message cannot exceed 500 characters")
    .escape() // prevent HTML / script injection
];

module.exports = {
  sendMessageValidator
};
