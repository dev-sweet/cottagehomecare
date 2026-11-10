const Doctor = require("../models/doctor.model");
const Patient = require("../models/patient.model");

const buildDateMatch = (startDate, endDate) => {
  if (!startDate && !endDate) return {};
  const createdAt = {};
  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start.getTime())) {
      start.setHours(0, 0, 0, 0);
      createdAt.$gte = start;
    }
  }
  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
      end.setHours(23, 59, 59, 999);
      createdAt.$lte = end;
    }
  }
  return Object.keys(createdAt).length > 0 ? { createdAt } : {};
};

const getDashboardAnalytics = async (query = {}) => {
  const dateMatch = buildDateMatch(query.startDate, query.endDate);
  const dateFormat = query.interval === "month" ? "%Y-%m" : "%Y-%m-%d";

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [doctorStatsResult, patientStatsResult, patientsPerDoctor] =
    await Promise.all([
      Doctor.aggregate([
        { $match: dateMatch },
        {
          $facet: {
            totalCount: [{ $count: "count" }],
            recentCount: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
            bySpecialization: [
              {
                $group: {
                  _id: "$specialization",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              {
                $project: {
                  _id: 0,
                  specialization: "$_id",
                  count: 1,
                },
              },
            ],
            byHospital: [
              {
                $group: {
                  _id: "$hospital",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              {
                $project: {
                  _id: 0,
                  hospital: "$_id",
                  count: 1,
                },
              },
            ],
            dateTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: dateFormat, date: "$createdAt" },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  _id: 0,
                  date: "$_id",
                  count: 1,
                },
              },
            ],
          },
        },
      ]),

      Patient.aggregate([
        { $match: dateMatch },
        {
          $facet: {
            totalCount: [{ $count: "count" }],
            recentCount: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
            byCondition: [
              {
                $group: {
                  _id: "$condition",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              {
                $project: {
                  _id: 0,
                  condition: "$_id",
                  count: 1,
                },
              },
            ],
            byStatus: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
              {
                $project: {
                  _id: 0,
                  status: "$_id",
                  count: 1,
                },
              },
            ],
            dateTrend: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: dateFormat, date: "$createdAt" },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
              {
                $project: {
                  _id: 0,
                  date: "$_id",
                  count: 1,
                },
              },
            ],
          },
        },
      ]),

      Doctor.aggregate([
        { $match: dateMatch },
        {
          $lookup: {
            from: "patients",
            localField: "_id",
            foreignField: "doctor",
            as: "patientsList",
          },
        },
        {
          $project: {
            _id: 0,
            doctorId: "$_id",
            name: 1,
            specialization: 1,
            hospital: 1,
            patientCount: { $size: "$patientsList" },
          },
        },
        { $sort: { patientCount: -1, name: 1 } },
      ]),
    ]);

  const doctorFacet = doctorStatsResult[0] || {};
  const patientFacet = patientStatsResult[0] || {};

  const totalDoctors = doctorFacet.totalCount?.[0]?.count || 0;
  const totalPatients = patientFacet.totalCount?.[0]?.count || 0;
  const recentDoctorsLast30Days = doctorFacet.recentCount?.[0]?.count || 0;
  const recentPatientsLast30Days = patientFacet.recentCount?.[0]?.count || 0;
  const averagePatientsPerDoctor =
    totalDoctors > 0
      ? Number((totalPatients / totalDoctors).toFixed(2))
      : 0;

  const doctorsBySpecialization = doctorFacet.bySpecialization || [];
  const doctorsByHospital = doctorFacet.byHospital || [];
  const patientsByCondition = patientFacet.byCondition || [];
  const patientsByStatus = patientFacet.byStatus || [];
  const doctorsDateTrend = doctorFacet.dateTrend || [];
  const patientsDateTrend = patientFacet.dateTrend || [];

  return {
    summary: {
      totalDoctors,
      totalPatients,
      averagePatientsPerDoctor,
      recentDoctorsLast30Days,
      recentPatientsLast30Days,
    },
    patientsPerDoctor,
    distributions: {
      doctorsBySpecialization,
      doctorsByHospital,
      patientsByCondition,
      patientsByStatus,
    },
    dateBasedStatistics: {
      interval: query.interval === "month" ? "month" : "day",
      doctorsTrend: doctorsDateTrend,
      patientsTrend: patientsDateTrend,
    },
    charts: {
      patientsPerDoctorBarChart: {
        labels: patientsPerDoctor.map((d) => d.name),
        data: patientsPerDoctor.map((d) => d.patientCount),
      },
      patientsByConditionPieChart: {
        labels: patientsByCondition.map((c) => c.condition),
        data: patientsByCondition.map((c) => c.count),
      },
      doctorsBySpecializationPieChart: {
        labels: doctorsBySpecialization.map((s) => s.specialization),
        data: doctorsBySpecialization.map((s) => s.count),
      },
      patientsRegistrationLineChart: {
        labels: patientsDateTrend.map((t) => t.date),
        data: patientsDateTrend.map((t) => t.count),
      },
    },
  };
};

module.exports = {
  getDashboardAnalytics,
};

