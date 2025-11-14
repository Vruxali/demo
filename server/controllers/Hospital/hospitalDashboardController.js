const mongoose = require("mongoose");
const { InventoryEntry, InventoryIssue } = require("../../models/inventory.model");
const BloodRequest = require("../../models/bloodRequest.model");

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

exports.getHospitalDashboardData = async (req, res) => {
  try {
    const orgId = req.user.id;

    // Inventory balance by blood group + component
    const inAgg = await InventoryEntry.aggregate([
      { $match: { orgId: toObjectId(orgId) } },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);
    const outAgg = await InventoryIssue.aggregate([
      { $match: { orgId: toObjectId(orgId) } },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);

    const outMap = new Map();
    outAgg.forEach((o) => {
      outMap.set(`${o._id.bloodGroup}|${o._id.componentType}`, o.units);
    });

    const balanceByBG = new Map();
    inAgg.forEach((i) => {
      const key = `${i._id.bloodGroup}|${i._id.componentType}`;
      const consumed = outMap.get(key) || 0;
      const bal = Math.max(0, (i.units || 0) - consumed);
      const bg = i._id.bloodGroup;
      balanceByBG.set(bg, (balanceByBG.get(bg) || 0) + bal);
    });

    const availableBlood = Array.from(balanceByBG.entries()).map(([bloodType, units]) => ({
      bloodType,
      units,
      updatedAt: new Date().toLocaleDateString("en-IN"),
    }));

    const totalAvailableUnits = availableBlood.reduce((s, x) => s + (x.units || 0), 0);

    // Donations (units) recorded via IN entries with sourceType Donation
    const donationAgg = await InventoryEntry.aggregate([
      { $match: { orgId: toObjectId(orgId), sourceType: "Donation" } },
      { $group: { _id: null, total: { $sum: "$units" } } },
    ]);
    const totalDonations = donationAgg?.[0]?.total || 0;

    // Requests approved by this hospital
    const approvedCountAgg = await BloodRequest.aggregate([
      { $unwind: "$subRequests" },
      { $match: { "subRequests.approvedBy.userId": toObjectId(orgId) } },
      { $count: "count" },
    ]);
    const approvedRequests = approvedCountAgg?.[0]?.count || 0;

    // Pending requests (approved by this hospital but not fulfilled)
    const pendingAgg = await BloodRequest.aggregate([
      { $unwind: "$subRequests" },
      { $match: { "subRequests.approvedBy.userId": toObjectId(orgId), "subRequests.status": { $ne: "fulfilled" } } },
      { $count: "count" },
    ]);
    const pendingRequestsCount = pendingAgg?.[0]?.count || 0;

    // List a few pending requests
    const pendingList = await BloodRequest.aggregate([
      { $unwind: "$subRequests" },
      { $match: { "subRequests.approvedBy.userId": toObjectId(orgId), "subRequests.status": { $ne: "fulfilled" } } },
      { $sort: { "subRequests.requestDate": -1 } },
      { $limit: 8 },
      { $project: {
          requesterEmail: "$requesterEmail",
          bloodType: "$subRequests.bloodGroup",
          quantity: "$subRequests.unitsRequired",
          date: "$subRequests.requestDate",
          status: "$subRequests.status",
        }
      },
    ]);

    const requests = pendingList.map((r) => ({
      requesterName: r.requesterEmail,
      bloodType: r.bloodType || "—",
      quantity: r.quantity || 0,
      date: r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—",
      status: (r.status || "approved").replace(/^./, (c) => c.toUpperCase()),
    }));

    return res.json({
      user: { hospitalName: req.user.name || "Hospital" },
      bloodInventory: availableBlood,
      pendingRequests: requests,
      stats: {
        totalDonations,
        pendingRequests: pendingRequestsCount,
        availableUnits: totalAvailableUnits,
        approvedRequests,
      },
    });
  } catch (err) {
    console.error("getHospitalDashboardData error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
