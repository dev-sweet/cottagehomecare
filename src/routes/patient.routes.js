const { Router } = require("express");
const patientController = require("../controllers/patient.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createPatientValidator,
  updatePatientValidator,
  patientIdParamValidator,
} = require("../validators/patient.validator");

const router = Router();

router.use(authenticate);

router.post("/", createPatientValidator, patientController.createPatient);
router.get("/", patientController.getAllPatients);
router.get("/:id", patientIdParamValidator, patientController.getPatientById);
router.put("/:id", updatePatientValidator, patientController.updatePatient);
router.patch("/:id", updatePatientValidator, patientController.updatePatient);
router.delete("/:id", patientIdParamValidator, patientController.deletePatient);

module.exports = router;

