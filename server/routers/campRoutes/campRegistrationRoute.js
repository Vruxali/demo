const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { createRegistration, listRegistrations } = require("../../controllers/Camp/campRegistrationController");

router.post("/", verifyToken, createRegistration);
router.get("/", verifyToken, listRegistrations); // NGO only

module.exports = router;
