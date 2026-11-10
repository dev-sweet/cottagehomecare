const { body, param, validationResult } = require("express-validator");
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

const createPatientValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Patient name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("condition")
    .trim()
    .notEmpty()
    .withMessage("Patient condition is required"),
  body("doctor")
    .notEmpty()
    .withMessage("Assigned doctor ID is required")
    .isMongoId()
    .withMessage("Invalid doctor ID format"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("age")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("Age must be a valid number between 0 and 150"),
  handleValidationErrors,
];

const updatePatientValidator = [
  param("id").isMongoId().withMessage("Invalid patient ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Patient name cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone number cannot be empty"),
  body("condition")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Patient condition cannot be empty"),
  body("doctor")
    .optional()
    .isMongoId()
    .withMessage("Invalid doctor ID format"),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("age")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("Age must be a valid number between 0 and 150"),
  handleValidationErrors,
];

const patientIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid patient ID"),
  handleValidationErrors,
];

module.exports = {
  createPatientValidator,
  updatePatientValidator,
  patientIdParamValidator,
};

