const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");
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

const createDoctor = async ({ name, specialization, hospital, phone, email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingDoctor = await Doctor.findOne({ email: normalizedEmail });

  if (existingDoctor) {
    throw createHttpError("A doctor with this email already exists", 409);
  }

  const doctor = await Doctor.create({
    name,
    specialization,
    hospital,
    phone,
    email: normalizedEmail,
  });

  return doctor;
};

const getAllDoctors = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.search && query.search.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { name: regex },
      { specialization: regex },
      { hospital: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  if (query.specialization && query.specialization.trim()) {
    filter.specialization = new RegExp(
      `^${escapeRegex(query.specialization.trim())}$`,
      "i"
    );
  }

  if (query.hospital && query.hospital.trim()) {
    filter.hospital = new RegExp(
      `^${escapeRegex(query.hospital.trim())}$`,
      "i"
    );
  }

  const dateFilter = buildDateRangeFilter(query.startDate, query.endDate);
  if (dateFilter) {
    filter.createdAt = dateFilter;
  }

  const allowedSortFields = ["createdAt", "name", "specialization", "hospital"];
  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .populate("patientCount")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit),
    Doctor.countDocuments(filter),
  ]);

  return {
    doctors,
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

const getDoctorById = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId)
    .populate("patientCount")
    .populate({
      path: "patients",
      options: { sort: { createdAt: -1 } },
    });

  if (!doctor) {
    throw createHttpError("Doctor not found", 404);
  }

  return doctor;
};

const updateDoctor = async (doctorId, updateData) => {
  if (updateData.email) {
    const normalizedEmail = updateData.email.toLowerCase().trim();
    const duplicate = await Doctor.findOne({
      email: normalizedEmail,
      _id: { $ne: doctorId },
    });
    if (duplicate) {
      throw createHttpError("Another doctor with this email already exists", 409);
    }
    updateData.email = normalizedEmail;
  }

  const doctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
    new: true,
    runValidators: true,
  }).populate("patientCount");

  if (!doctor) {
    throw createHttpError("Doctor not found", 404);
  }

  return doctor;
};

const deleteDoctor = async (doctorId) => {
  const doctor = await Doctor.findByIdAndDelete(doctorId);
  if (!doctor) {
    throw createHttpError("Doctor not found", 404);
  }

  // Delete associated patients under this doctor
  await Patient.deleteMany({ doctor: doctorId });

  return doctor;
};

const getDoctorPatients = async (doctorId, query = {}) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw createHttpError("Doctor not found", 404);
  }

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { doctor: doctorId };

  if (query.search && query.search.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { condition: regex },
      { notes: regex },
    ];
  }

  if (query.condition && query.condition.trim()) {
    filter.condition = new RegExp(
      `^${escapeRegex(query.condition.trim())}$`,
      "i"
    );
  }

  if (query.status && query.status.trim()) {
    filter.status = new RegExp(`^${escapeRegex(query.status.trim())}$`, "i");
  }

  const dateFilter = buildDateRangeFilter(query.startDate, query.endDate);
  if (dateFilter) {
    filter.createdAt = dateFilter;
  }

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Patient.countDocuments(filter),
  ]);

  return {
    doctor: {
      _id: doctor._id,
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      email: doctor.email,
      phone: doctor.phone,
    },
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

const addPatientToDoctor = async (doctorId, patientData) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw createHttpError("Doctor not found", 404);
  }

  const patient = await Patient.create({
    ...patientData,
    doctor: doctorId,
  });

  return patient.populate("doctor", "name specialization hospital phone email");
};

const deletePatientFromDoctor = async (doctorId, patientId) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw createHttpError("Doctor not found", 404);
  }

  const patient = await Patient.findOneAndDelete({
    _id: patientId,
    doctor: doctorId,
  });

  if (!patient) {
    throw createHttpError("Patient not found under this doctor", 404);
  }

  return patient;
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

