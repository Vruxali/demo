const mongoose = require("mongoose");
const Camp = require("../../models/camp.model");
const oid = (id) => new mongoose.Types.ObjectId(id);

function requireNgo(req, res) {
  if (!req.user || req.user.role !== "ngo") {
    res.status(403).json({ message: "NGO only" });
    return false;
  }
  return true;
}

exports.createCamp = async (req, res) => {
  if (!requireNgo(req, res)) return;
  try {
    const { title, location, city, organizerName = "", expectedDonors = 0, date, time, notes = "" } = req.body;
    if (!title || !location || !city || !date) return res.status(400).json({ message: "Missing required fields" });
    const startDateTime = new Date(time ? `${date}T${time}:00` : `${date}T00:00:00`);
    const status = startDateTime > new Date() ? "upcoming" : "completed";
    const camp = await Camp.create({
      orgId: oid(req.user.id),
      orgRole: "ngo",
      title,
      location,
      city,
      organizerName,
      expectedDonors: Number(expectedDonors || 0),
      startDateTime,
      notes,
      status,
      createdBy: oid(req.user.id),
    });
    return res.status(201).json({ camp });
  } catch (err) {
    console.error("createCamp error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.listCamps = async (req, res) => {
  if (!requireNgo(req, res)) return;
  try {
    const { q = "", status = "", city = "" } = req.query;
    const match = { orgId: oid(req.user.id) };
    if (status) match.status = status;
    if (city) match.city = city;
    if (q) match.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { city: { $regex: q, $options: "i" } },
      { organizerName: { $regex: q, $options: "i" } }
    ];
    const camps = await Camp.find(match).sort({ startDateTime: -1 }).lean();
    return res.json({ camps });
  } catch (err) {
    console.error("listCamps error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateCamp = async (req, res) => {
  if (!requireNgo(req, res)) return;
  try {
    const { id } = req.params;
    const camp = await Camp.findOne({ _id: oid(id), orgId: oid(req.user.id) });
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    const { status, title, location, city, organizerName, expectedDonors, date, time, notes } = req.body;
    if (status && ["upcoming","completed","cancelled"].includes(status)) camp.status = status;
    if (title) camp.title = title;
    if (location) camp.location = location;
    if (city) camp.city = city;
    if (organizerName !== undefined) camp.organizerName = organizerName;
    if (expectedDonors !== undefined) camp.expectedDonors = Number(expectedDonors || 0);
    if (notes !== undefined) camp.notes = notes;
    if (date) {
      const dt = new Date(time ? `${date}T${time}:00` : `${date}T00:00:00`);
      camp.startDateTime = dt;
    }
    await camp.save();
    return res.json({ camp });
  } catch (err) {
    console.error("updateCamp error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Public/any authenticated user: list upcoming camps across NGOs
exports.publicAvailableCamps = async (req, res) => {
  try {
    const now = new Date();
    // Show future camps including those marked as cancelled
    const camps = await Camp.find({ startDateTime: { $gte: now } })
      .sort({ startDateTime: 1 })
      .select("title location city startDateTime orgId status")
      .lean();
    return res.json({ camps });
  } catch (err) {
    console.error("publicAvailableCamps error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// NGO only: get single camp details
exports.getCampById = async (req, res) => {
  if (!requireNgo(req, res)) return;
  try {
    const { id } = req.params;
    const camp = await Camp.findOne({ _id: oid(id), orgId: oid(req.user.id) }).lean();
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    return res.json({ camp });
  } catch (err) {
    console.error("getCampById error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
