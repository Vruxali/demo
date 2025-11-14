const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth");
const {
  createInventoryEntry,
  listInventoryEntries,
  issueInventory,
  listIssuedInventory,
  getInventorySummary,
  getExpirySummary,
} = require("../../controllers/inventory/inventoryController");

// IN entries
router.post("/in", verifyToken, createInventoryEntry);
router.get("/in", verifyToken, listInventoryEntries);

// OUT issues
router.post("/out", verifyToken, issueInventory);
router.get("/out", verifyToken, listIssuedInventory);

// Dashboard summary
router.get("/summary", verifyToken, getInventorySummary);
router.get("/expiry-summary", verifyToken, getExpirySummary);

module.exports = router;
