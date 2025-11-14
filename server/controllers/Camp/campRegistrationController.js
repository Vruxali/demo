const mongoose = require("mongoose");
const Camp = require("../../models/camp.model");
const CampRegistration = require("../../models/campRegistration.model");

const oid = (id) => new mongoose.Types.ObjectId(id);

function requireAuth(req, res) {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return false;
  }
  return true;
}

function requireNgo(req, res) {
  if (!req.user || req.user.role?.toLowerCase() !== "ngo") {
    res.status(403).json({ message: "NGO only" });
    return false;
  }
  return true;
}

exports.createRegistration = async (req, res) => {
  if (!requireAuth(req, res)) return;
  try {
    const { campId, type, name, email = "", phone = "", city = "", bloodGroup = "", availability = "", notes = "" } = req.body;
    if (!campId || !type || !name) return res.status(400).json({ message: "Missing required fields" });

    if (!["donor", "volunteer"].includes(type)) return res.status(400).json({ message: "Invalid registration type" });

    const camp = await Camp.findById(campId).lean();
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    if (camp.status === "cancelled") return res.status(400).json({ message: "Camp has been cancelled" });

    // Prevent duplicate registration for the same user on the same camp (across both types)
    const existing = await CampRegistration.findOne({ campId: oid(campId), registrantUserId: oid(req.user.id) }).lean();
    if (existing) {
      return res.status(409).json({ message: "You are already registered for this camp." });
    }

    const payload = {
      campId: oid(campId),
      orgId: oid(camp.orgId),
      type,
      registrantUserId: oid(req.user.id),
      name,
      email,
      phone,
      city,
      bloodGroup,
      availability,
      notes,
    };

    let reg;
    try {
      reg = await CampRegistration.create(payload);
    } catch (e) {
      if (e && e.code === 11000) {
        return res.status(409).json({ message: "You are already registered for this camp." });
      }
      throw e;
    }
    return res.status(201).json({ registration: reg });
  } catch (err) {
    console.error("createRegistration error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// NGO listings
exports.listRegistrations = async (req, res) => {
  if (!requireNgo(req, res)) return;
  try {
    const { type = "", campId = "" } = req.query;
    const match = { orgId: oid(req.user.id) };
    if (type) match.type = type;
    if (campId) match.campId = oid(campId);

    const regs = await CampRegistration.find(match)
      .sort({ createdAt: -1 })
      .populate("campId", "title startDateTime location city status")
      .lean();
    return res.json({ registrations: regs });
  } catch (err) {
    console.error("listRegistrations error", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
