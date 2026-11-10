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

const createDoctorValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Doctor name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),
  body("hospital")
    .trim()
    .notEmpty()
    .withMessage("Hospital name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  handleValidationErrors,
];

const updateDoctorValidator = [
  param("doctorId").isMongoId().withMessage("Invalid doctor ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Doctor name cannot be empty"),
  body("specialization")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Specialization cannot be empty"),
  body("hospital")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Hospital name cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Phone number cannot be empty"),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  handleValidationErrors,
];

const doctorIdParamValidator = [
  param("doctorId").isMongoId().withMessage("Invalid doctor ID"),
  handleValidationErrors,
];

const addPatientToDoctorValidator = [
  param("doctorId").isMongoId().withMessage("Invalid doctor ID"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Patient name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Patient phone number is required"),
  body("condition")
    .trim()
    .notEmpty()
    .withMessage("Patient condition is required"),
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

const removePatientFromDoctorValidator = [
  param("doctorId").isMongoId().withMessage("Invalid doctor ID"),
  param("patientId").isMongoId().withMessage("Invalid patient ID"),
  handleValidationErrors,
];

module.exports = {
  createDoctorValidator,
  updateDoctorValidator,
  doctorIdParamValidator,
  addPatientToDoctorValidator,
  removePatientFromDoctorValidator,
};

