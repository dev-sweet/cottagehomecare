const Patient = require("../models/patient.model");
const Doctor = require("../models/doctor.model");
const { createHttpError } = require("../utils/api-response");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildDateRangeFilter = (startDate, endDate) => {
  if (!startDate && !endDate) return null;
  const dateFilter = {};
  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      dateFilter.$gte = start;
    }
  }
  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
  }
  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

const createPatient = async (patientData) => {
  const doctor = await Doctor.findById(patientData.doctor);
  if (!doctor) {
    throw createHttpError("Assigned doctor not found", 404);
  }

  const patient = await Patient.create(patientData);
  return patient.populate("doctor", "name specialization hospital phone email");
};

const getAllPatients = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.search && query.search.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { condition: regex },
      { status: regex },
      { notes: regex },
    ];
  }

  if (query.condition && query.condition.trim()) {
    filter.condition = new RegExp(
      escapeRegex(query.condition.trim()),
      "i"
    );
  }

  if (query.status && query.status.trim()) {
    filter.status = new RegExp(`^${escapeRegex(query.status.trim())}$`, "i");
  }

  if (query.gender && query.gender.trim()) {
    filter.gender = new RegExp(`^${escapeRegex(query.gender.trim())}$`, "i");
  }

  const doctorFilterId = query.doctorId || query.doctor;
  if (doctorFilterId) {
    filter.doctor = doctorFilterId;
  }

  const dateFilter = buildDateRangeFilter(query.startDate, query.endDate);
  if (dateFilter) {
    filter.createdAt = dateFilter;
  }

  const allowedSortFields = [
    "createdAt",
    "name",
    "condition",
    "status",
    "age",
    "admissionDate",
  ];
  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .populate("doctor", "name specialization hospital phone email")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Patient.countDocuments(filter),
  ]);

  return {
    patients,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

const getPatientById = async (patientId) => {
  const patient = await Patient.findById(patientId).populate(
    "doctor",
    "name specialization hospital phone email"
  );

  if (!patient) {
    throw createHttpError("Patient not found", 404);
  }

  return patient;
};

const updatePatient = async (patientId, updateData) => {
  if (updateData.doctor) {
    const doctor = await Doctor.findById(updateData.doctor);
    if (!doctor) {
      throw createHttpError("Assigned doctor not found", 404);
    }
  }

  const patient = await Patient.findByIdAndUpdate(patientId, updateData, {
    new: true,
    runValidators: true,
  }).populate("doctor", "name specialization hospital phone email");

  if (!patient) {
    throw createHttpError("Patient not found", 404);
  }

  return patient;
};

const deletePatient = async (patientId) => {
  const patient = await Patient.findByIdAndDelete(patientId);
  if (!patient) {
    throw createHttpError("Patient not found", 404);
  }

  return patient;
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};

