const { Router } = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = Router();

router.use(authenticate);

router.get("/", dashboardController.getAnalytics);
router.get("/analytics", dashboardController.getAnalytics);

module.exports = router;

