const mongoose = require("mongoose");
const { InventoryEntry, InventoryIssue } = require("../../models/inventory.model");

const normalizeRole = (role) => {
  const r = (role || "").toLowerCase();
  if (r.includes("blood")) return "blood-bank";
  if (r.includes("hospital")) return "hospital";
  return r;
};

// Create inventory IN entry
exports.createInventoryEntry = async (req, res) => {
  try {
    const orgRole = normalizeRole(req.user.role);
    const orgId = req.user.id;
    const {
      bloodGroup,
      componentType,
      units,
      sourceType,
      sourceName,
      sourceRefId,
      collectionDate,
      receivedDate,
      expiryDate,
      storageLocation,
      notes,
    } = req.body;

    const toObjectId = (v) => (v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : undefined);

    const entry = await InventoryEntry.create({
      orgId,
      orgRole,
      bloodGroup,
      componentType,
      units,
      sourceType,
      sourceName,
      sourceRefId: toObjectId(sourceRefId),
      collectionDate,
      receivedDate,
      expiryDate,
      storageLocation,
      notes,
      createdBy: orgId,
    });

    return res.status(201).json({ message: "Inventory recorded", entry });
  } catch (err) {
    console.error("createInventoryEntry error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// List inventory IN entries (with filters)
exports.listInventoryEntries = async (req, res) => {
  try {
    const orgRole = normalizeRole(req.user.role);
    const orgId = req.user.id;
    const { bloodGroup, componentType, sourceType } = req.query;

    const q = { orgId, orgRole };
    if (bloodGroup) q.bloodGroup = bloodGroup;
    if (componentType) q.componentType = componentType;
    if (sourceType) q.sourceType = sourceType;

    const entries = await InventoryEntry.find(q).sort({ createdAt: -1 }).lean();
    return res.json({ entries });
  } catch (err) {
    console.error("listInventoryEntries error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create issued OUT record (validates stock and expiry)
exports.issueInventory = async (req, res) => {
  try {
    const orgRole = normalizeRole(req.user.role);
    const orgId = req.user.id;
    const {
      bloodGroup,
      componentType,
      units,
      issuedToType,
      issuedToName,
      issuedToRefId,
      requestRefId,
      issuedDate,
      notes,
    } = req.body;

    const effectiveDate = issuedDate ? new Date(issuedDate) : new Date();

    // Compute current non-expired stock for given BG + component
    const matchEntries = {
      orgId: new mongoose.Types.ObjectId(orgId),
      orgRole,
      bloodGroup,
      componentType,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: null },
        { expiryDate: { $gte: effectiveDate } },
      ],
    };
    const [inAgg] = await InventoryEntry.aggregate([
      { $match: matchEntries },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const [outAgg] = await InventoryIssue.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId), orgRole, bloodGroup, componentType } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);

    const inTotal = inAgg?.total || 0;
    const outTotal = outAgg?.total || 0;
    const available = inTotal - outTotal;

    if (units > available) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${available} units`,
      });
    }

    const toObjectId = (v) => (v && mongoose.Types.ObjectId.isValid(v) ? new mongoose.Types.ObjectId(v) : undefined);

    const issue = await InventoryIssue.create({
      orgId,
      orgRole,
      bloodGroup,
      componentType,
      units,
      issuedToType,
      issuedToName,
      issuedToRefId: toObjectId(issuedToRefId),
      requestRefId: toObjectId(requestRefId),
      issuedDate,
      notes,
      createdBy: orgId,
    });

    return res.status(201).json({ message: "Units issued", issue });
  } catch (err) {
    console.error("issueInventory error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// List issued OUT records
exports.listIssuedInventory = async (req, res) => {
  try {
    const orgRole = normalizeRole(req.user.role);
    const orgId = req.user.id;
    const { bloodGroup, componentType, issuedToType } = req.query;

    const q = { orgId, orgRole };
    if (bloodGroup) q.bloodGroup = bloodGroup;
    if (componentType) q.componentType = componentType;
    if (issuedToType) q.issuedToType = issuedToType;

    const issues = await InventoryIssue.find(q).sort({ createdAt: -1 }).lean();
    return res.json({ issues });
  } catch (err) {
    console.error("listIssuedInventory error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Stock summary for dashboard cards
exports.getInventorySummary = async (req, res) => {
  try {
    const orgRole = normalizeRole(req.user.role);
    const orgId = req.user.id;
    const now = new Date();

    // Include only non-expired stock for available balance
    const inTotals = await InventoryEntry.aggregate([
      {
        $match: {
          orgId: new mongoose.Types.ObjectId(orgId),
          orgRole,
          $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gte: now } },
            { expiryDate: null },
          ],
        },
      },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);

    const outTotals = await InventoryIssue.aggregate([
      { $match: { orgId: new mongoose.Types.ObjectId(orgId), orgRole } },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);

    const outMap = new Map();
    outTotals.forEach((o) => {
      outMap.set(`${o._id.bloodGroup}|${o._id.componentType}`, o.units);
    });

    const summary = inTotals.map((i) => {
      const key = `${i._id.bloodGroup}|${i._id.componentType}`;
      const consumed = outMap.get(key) || 0;
      const balance = Math.max(0, i.units - consumed);
      const status = balance >= 20 ? "Good Stock" : balance >= 5 ? "Low Stock" : "Critical";
      return {
        type: `${i._id.bloodGroup} ${i._id.componentType}`,
        units: balance,
        status,
        updated: new Date().toLocaleDateString("en-IN"),
        bloodGroup: i._id.bloodGroup,
        componentType: i._id.componentType,
      };
    });

    return res.json({ summary });
  } catch (err) {
    console.error("getInventorySummary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Expiry summary (expired and expiring within 7 days)
exports.getExpirySummary = async (req, res) => {
  try {
    const orgRole = normalizeRole(req.user.role);
    const orgId = req.user.id;
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);

    const expiredAgg = await InventoryEntry.aggregate([
      {
        $match: {
          orgId: new mongoose.Types.ObjectId(orgId),
          orgRole,
          expiryDate: { $lt: now },
        },
      },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);

    const expSoonAgg = await InventoryEntry.aggregate([
      {
        $match: {
          orgId: new mongoose.Types.ObjectId(orgId),
          orgRole,
          expiryDate: { $gte: now, $lte: soon },
        },
      },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);

    const format = (it, status) =>
      it.map((i) => ({
        type: `${i._id.bloodGroup} ${i._id.componentType}`,
        units: i.units,
        status,
        updated: now.toLocaleDateString("en-IN"),
        bloodGroup: i._id.bloodGroup,
        componentType: i._id.componentType,
      }));

    return res.json({
      expired: format(expiredAgg, "Expired"),
      expiringSoon: format(expSoonAgg, "Expiring Soon"),
    });
  } catch (err) {
    console.error("getExpirySummary error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
