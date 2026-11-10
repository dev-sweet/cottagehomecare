const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      index: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
      index: true,
    },
    hospital: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for optimized filtering and sorting
doctorSchema.index({ specialization: 1, hospital: 1, createdAt: -1 });
doctorSchema.index({ createdAt: -1 });

// Virtual field to populate patients assigned to this doctor
doctorSchema.virtual("patients", {
  ref: "Patient",
  localField: "_id",
  foreignField: "doctor",
});

doctorSchema.virtual("patientCount", {
  ref: "Patient",
  localField: "_id",
  foreignField: "doctor",
  count: true,
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;

