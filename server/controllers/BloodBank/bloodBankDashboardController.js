const mongoose = require("mongoose");
const { InventoryEntry, InventoryIssue } = require("../../models/inventory.model");
const BloodRequest = require("../../models/bloodRequest.model");
const User = require("../../models/user.model");

const oid = (id) => new mongoose.Types.ObjectId(id);

exports.getBloodBankDashboardData = async (req, res) => {
  try {
    const orgId = req.user.id;

    // Balance by blood group across components
    const inAgg = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);
    const outAgg = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId) } },
      { $group: { _id: { bloodGroup: "$bloodGroup", componentType: "$componentType" }, units: { $sum: "$units" } } },
    ]);

    const outMap = new Map();
    outAgg.forEach((o) => outMap.set(`${o._id.bloodGroup}|${o._id.componentType}`, o.units));
    const balanceByBG = new Map();
    inAgg.forEach((i) => {
      const key = `${i._id.bloodGroup}|${i._id.componentType}`;
      const consumed = outMap.get(key) || 0;
      const bal = Math.max(0, (i.units || 0) - consumed);
      balanceByBG.set(i._id.bloodGroup, (balanceByBG.get(i._id.bloodGroup) || 0) + bal);
    });

    const statusFor = (units) => (units >= 150 ? "Good Stock" : units >= 50 ? "Low Stock" : "Critical");
    const nowStr = new Date().toLocaleString("en-IN");
    const inventory = Array.from(balanceByBG.entries()).map(([type, units]) => ({
      type,
      units,
      status: statusFor(units),
      updated: nowStr,
    }));

    // Monthly donations vs usage (last 12 months)
    const monthsBack = 12;
    const start = new Date();
    start.setMonth(start.getMonth() - (monthsBack - 1));
    start.setDate(1);

    const donationMonthly = await InventoryEntry.aggregate([
      { $match: { orgId: oid(orgId), sourceType: "Donation", receivedDate: { $gte: start } } },
      { $project: { ym: { $dateToString: { format: "%Y-%m", date: "$receivedDate" } }, units: "$units" } },
      { $group: { _id: "$ym", total: { $sum: "$units" } } },
      { $sort: { _id: 1 } },
    ]);
    const issueMonthly = await InventoryIssue.aggregate([
      { $match: { orgId: oid(orgId), issuedDate: { $gte: start } } },
      { $project: { ym: { $dateToString: { format: "%Y-%m", date: "$issuedDate" } }, units: "$units" } },
      { $group: { _id: "$ym", total: { $sum: "$units" } } },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const chartData = [];
    const cursor = new Date(start);
    for (let i = 0; i < monthsBack; i++) {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const key = `${y}-${String(m + 1).padStart(2, "0")}`;
      const donations = donationMonthly.find((x) => x._id === key)?.total || 0;
      const usage = issueMonthly.find((x) => x._id === key)?.total || 0;
      chartData.push({ month: monthNames[m], donations, usage });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    // Connected hospitals: show recently updated hospitals (fallback when there is no direct link data)
    const recentHospitals = await User.find({ role: "hospital" })
      .select("fullName hospitalDetails.name updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean();
    const hospitals = (recentHospitals || []).map((h) => ({
      name: h.fullName || h?.hospitalDetails?.name || "Hospital",
      lastRequest: h.updatedAt ? new Date(h.updatedAt).toLocaleString("en-IN") : "—",
    }));

    return res.json({
      inventory,
      chartData,
      hospitals,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("getBloodBankDashboardData error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
