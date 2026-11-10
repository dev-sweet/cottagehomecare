const doctorService = require("../services/doctor.service");
const { sendSuccess } = require("../utils/api-response");

const createDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    return sendSuccess(res, 201, "Doctor created successfully", { doctor });
  } catch (error) {
    next(error);
  }
};

const getAllDoctors = async (req, res, next) => {
  try {
    const result = await doctorService.getAllDoctors(req.query);
    return sendSuccess(res, 200, "Doctors retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.doctorId);
    return sendSuccess(res, 200, "Doctor retrieved successfully", { doctor });
  } catch (error) {
    next(error);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorService.updateDoctor(
      req.params.doctorId,
      req.body
    );
    return sendSuccess(res, 200, "Doctor updated successfully", { doctor });
  } catch (error) {
    next(error);
  }
};

const deleteDoctor = async (req, res, next) => {
  try {
    await doctorService.deleteDoctor(req.params.doctorId);
    return sendSuccess(res, 200, "Doctor deleted successfully");
  } catch (error) {
    next(error);
  }
};

const getDoctorPatients = async (req, res, next) => {
  try {
    const result = await doctorService.getDoctorPatients(
      req.params.doctorId,
      req.query
    );
    return sendSuccess(
      res,
      200,
      "Doctor's patients retrieved successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};

const addPatientToDoctor = async (req, res, next) => {
  try {
    const patient = await doctorService.addPatientToDoctor(
      req.params.doctorId,
      req.body
    );
    return sendSuccess(
      res,
      201,
      "Patient added to doctor successfully",
      { patient }
    );
  } catch (error) {
    next(error);
  }
};

const deletePatientFromDoctor = async (req, res, next) => {
  try {
    await doctorService.deletePatientFromDoctor(
      req.params.doctorId,
      req.params.patientId
    );
    return sendSuccess(
      res,
      200,
      "Patient removed from doctor's list successfully"
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
  addPatientToDoctor,
  deletePatientFromDoctor,
};

