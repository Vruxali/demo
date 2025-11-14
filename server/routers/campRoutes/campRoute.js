const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const { createCamp, listCamps, updateCamp, publicAvailableCamps, getCampById } = require("../../controllers/Camp/campController");

router.post("/", verifyToken, createCamp);
router.get("/", verifyToken, listCamps);
router.patch("/:id", verifyToken, updateCamp);
// available to any authenticated user (donor/volunteer/hospital/etc.)
router.get("/available", verifyToken, publicAvailableCamps);
// NGO-only single camp detail (after static routes to avoid clash)
router.get("/:id", verifyToken, getCampById);

module.exports = router;
