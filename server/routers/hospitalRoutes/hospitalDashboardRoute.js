const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { getHospitalDashboardData } = require("../../controllers/Hospital/hospitalDashboardController");
const { getHospitalAnalytics } = require("../../controllers/Hospital/hospitalAnalyticsController");

router.get("/dashboard-data", verifyToken, getHospitalDashboardData);
router.get("/analytics-data", verifyToken, getHospitalAnalytics);

module.exports = router;
