const dashboardService = require("../services/dashboard.service");
const { sendSuccess } = require("../utils/api-response");

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await dashboardService.getDashboardAnalytics(req.query);
    return sendSuccess(
      res,
      200,
      "Dashboard analytics retrieved successfully",
      analytics
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
};

