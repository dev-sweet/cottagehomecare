const patientService = require("../services/patient.service");
const { sendSuccess } = require("../utils/api-response");

const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);
    return sendSuccess(res, 201, "Patient created successfully", { patient });
  } catch (error) {
    next(error);
  }
};

const getAllPatients = async (req, res, next) => {
  try {
    const result = await patientService.getAllPatients(req.query);
    return sendSuccess(res, 200, "Patients retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    return sendSuccess(res, 200, "Patient retrieved successfully", { patient });
  } catch (error) {
    next(error);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, "Patient updated successfully", { patient });
  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    await patientService.deletePatient(req.params.id);
    return sendSuccess(res, 200, "Patient deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};

