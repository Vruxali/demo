const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { getBloodBankDashboardData } = require("../../controllers/BloodBank/bloodBankDashboardController");
const { getBloodBankAnalytics } = require("../../controllers/BloodBank/bloodBankAnalyticsController");

router.get("/dashboard-data", verifyToken, getBloodBankDashboardData);
router.get("/analytics-data", verifyToken, getBloodBankAnalytics);

module.exports = router;
