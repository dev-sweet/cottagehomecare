const { Router } = require("express");
const doctorController = require("../controllers/doctor.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const {
  createDoctorValidator,
  updateDoctorValidator,
  doctorIdParamValidator,
  addPatientToDoctorValidator,
  removePatientFromDoctorValidator,
} = require("../validators/doctor.validator");

const router = Router();

router.use(authenticate);

// Doctor CRUD + Search, Filter & Pagination
router.post("/", createDoctorValidator, doctorController.createDoctor);
router.get("/", doctorController.getAllDoctors);
router.get("/:doctorId", doctorIdParamValidator, doctorController.getDoctorById);
router.put("/:doctorId", updateDoctorValidator, doctorController.updateDoctor);
router.patch("/:doctorId", updateDoctorValidator, doctorController.updateDoctor);
router.delete(
  "/:doctorId",
  doctorIdParamValidator,
  doctorController.deleteDoctor
);

// Doctor's Patient List Management
router.get(
  "/:doctorId/patients",
  doctorIdParamValidator,
  doctorController.getDoctorPatients
);
router.post(
  "/:doctorId/patients",
  addPatientToDoctorValidator,
  doctorController.addPatientToDoctor
);
router.delete(
  "/:doctorId/patients/:patientId",
  removePatientFromDoctorValidator,
  doctorController.deletePatientFromDoctor
);

module.exports = router;

