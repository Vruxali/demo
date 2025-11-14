const express = require("express");
const router = express.Router();
const {
  createBloodRequest,
  getAllBloodRequests,
  updateRequestStatus,
  getMyRequests,
  getMyDonationHistory,
  getMyRequestCount,
  getNearbyInstitutions,
  getAllInstitutions,
} = require("../../controllers/BloodRequest/bloodRequestController");
const { verifyToken } = require("../../middleware/auth");

// Create request
router.post("/", verifyToken, createBloodRequest);

// Get all requests
router.get("/", verifyToken, getAllBloodRequests);

// Update (approve or fulfill)
router.patch("/:parentId/:subId/status", verifyToken, updateRequestStatus);

// Get my requests
router.get("/my", verifyToken, getMyRequests);

router.get("/my-donations", verifyToken, getMyDonationHistory);  // For donor's donation history

router.get("/my-request-count", verifyToken, getMyRequestCount); //For counting total request of login user

router.get("/nearby-institutions", verifyToken, getNearbyInstitutions); // For DonorDashboard --> for nearby hospital and bloodbank card

router.get("/all-institutions", verifyToken, getAllInstitutions); // For "View All" page

module.exports = router;
