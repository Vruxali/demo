const mongoose = require("mongoose");
const { InventoryEntry, InventoryIssue } = require("../../models/inventory.model");
const BloodRequest = require("../../models/bloodRequest.model");

const oid = (id) => new mongoose.Types.ObjectId(id);

exports.getHospitalAnalytics = async (req, res) => {
  try {
    const orgId = req.user.id;
    const now = new Date();
    const daysBack = 14;
    const startRange = new Date();
    startRange.setDate(startRange.getDate() - daysBack + 1);

    // Daily requests approved by hospital (last 14 days)
    const dailyReqAgg = await BloodRequest.aggregate([
      { $unwind: "$subRequests" },
      { $match: { "subRequests.approvedBy.userId": oid(orgId), "subRequests.requestDate": { $gte: startRange } } },
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$subRequests.requestDate" } } } },
      { $group: { _id: "$day", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const dailyRequests = [];
    for (let i = 0; i < daysBack; i++) {
      const d = new Date(startRange);
      d.setDate(startRange.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      const found = dailyReqAgg.find((r) => r._id === key);
      dailyRequests.push({ date: key, count: found ? found.count : 0 });
    }

    // Donation vs Issuance units (total)
    const donationsAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId), sourceType: "Donation" } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const issuesAgg = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const donationsTotal = donationsAgg?.[0]?.total || 0;
    const issuesTotal = issuesAgg?.[0]?.total || 0;

    // Inventory distribution by blood group (balance)
    const inAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$bloodGroup", units: { $sum: "$units" } } },
    ]);
    const outAgg = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$bloodGroup", units: { $sum: "$units" } } },
    ]);
    const outMap = new Map(outAgg.map((o) => [o._id, o.units]));
    const inventoryDistribution = inAgg.map((i) => ({
      bloodGroup: i._id,
      balance: Math.max(0, (i.units || 0) - (outMap.get(i._id) || 0)),
    }));

    // Component distribution (balance by componentType)
    const inCompAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$componentType", units: { $sum: "$units" } } },
    ]);
    const outCompAgg = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$componentType", units: { $sum: "$units" } } },
    ]);
    const outCompMap = new Map(outCompAgg.map((o) => [o._id, o.units]));
    const componentDistribution = inCompAgg.map((c) => ({
      component: c._id,
      balance: Math.max(0, (c.units || 0) - (outCompMap.get(c._id) || 0)),
    }));

    // Expiry summary counts
    const today = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);
    const expiredCountAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId), expiryDate: { $lt: today } } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const expiringSoonCountAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId), expiryDate: { $gte: today, $lte: soon } } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const expiryStatus = {
      expiredUnits: expiredCountAgg?.[0]?.total || 0,
      expiringSoonUnits: expiringSoonCountAgg?.[0]?.total || 0,
    };

    return res.json({
      dailyRequests,
      donationsVsIssues: { donations: donationsTotal, issues: issuesTotal },
      inventoryDistribution,
      componentDistribution,
      expiryStatus,
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("getHospitalAnalytics error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
