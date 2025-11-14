const mongoose = require("mongoose");
const { InventoryEntry, InventoryIssue } = require("../../models/inventory.model");

const oid = (id) => new mongoose.Types.ObjectId(id);

exports.getBloodBankAnalytics = async (req, res) => {
  try {
    const orgId = req.user.id;
    const now = new Date();

    // Last 14 days donations vs issues
    const days = 14;
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));

    const dailyDonationsAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId), receivedDate: { $gte: start } } },
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$receivedDate" } }, units: "$units", isDonation: { $eq: ["$sourceType", "Donation"] } } },
      { $group: { _id: "$day", donations: { $sum: { $cond: ["$isDonation", "$units", 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    const dailyIssuesAgg = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId), issuedDate: { $gte: start } } },
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$issuedDate" } }, units: "$units" } },
      { $group: { _id: "$day", usage: { $sum: "$units" } } },
      { $sort: { _id: 1 } },
    ]);

    const daily = [];
    const ptr = new Date(start);
    for (let i = 0; i < days; i++) {
      const key = ptr.toISOString().slice(0, 10);
      daily.push({
        date: key,
        donations: dailyDonationsAgg.find((x) => x._id === key)?.donations || 0,
        usage: dailyIssuesAgg.find((x) => x._id === key)?.usage || 0,
      });
      ptr.setDate(ptr.getDate() + 1);
    }

    // Distribution by blood group (balance)
    const inBG = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$bloodGroup", units: { $sum: "$units" } } },
    ]);
    const outBG = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$bloodGroup", units: { $sum: "$units" } } },
    ]);
    const outBGMap = new Map(outBG.map((o) => [o._id, o.units]));
    const inventoryDistribution = inBG.map((i) => ({ bloodGroup: i._id, balance: Math.max(0, (i.units || 0) - (outBGMap.get(i._id) || 0)) }));

    // Component distribution (balance)
    const inComp = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$componentType", units: { $sum: "$units" } } },
    ]);
    const outComp = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: "$componentType", units: { $sum: "$units" } } },
    ]);
    const outCompMap = new Map(outComp.map((o) => [o._id, o.units]));
    const componentDistribution = inComp.map((c) => ({ component: c._id, balance: Math.max(0, (c.units || 0) - (outCompMap.get(c._id) || 0)) }));

    // Expiry status totals
    const today = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);
    const expiredAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId), expiryDate: { $lt: today } } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const expiringSoonAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId), expiryDate: { $gte: today, $lte: soon } } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);

    return res.json({
      daily,
      inventoryDistribution,
      componentDistribution,
      expiryStatus: {
        expiredUnits: expiredAgg?.[0]?.total || 0,
        expiringSoonUnits: expiringSoonAgg?.[0]?.total || 0,
      },
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("getBloodBankAnalytics error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
