const { body, validationResult } = require("express-validator");
const { sendError } = require("../utils/api-response");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstMessage = errors.array()[0].msg;
    return sendError(
      res,
      400,
      firstMessage,
      errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }))
    );
  }
  next();
};

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const refreshTokenValidator = [
  body("refreshToken")
    .optional()
    .isString()
    .withMessage("Refresh token must be a string"),
  handleValidationErrors,
];

module.exports = {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
};

