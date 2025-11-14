const BloodRequest = require("../../models/bloodRequest.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");

// Create new blood request
exports.createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      urgencyLevel,
      age,
      gender,
      contactNumber,
      email,
      city,
      state,
      hospitalAddress,
      doctorName,
      reason,
      dateRequired,
      notes,
    } = req.body;

    const requesterId = req.user.id;
    const requester = await User.findById(requesterId);
    const patientId = req.user.id;
    const newRequest = new BloodRequest({
      requesterId,
      requesterEmail: requester.email,
      subRequests: [
        {
          patientName,
          age,
          gender,
          bloodGroup,
          contactNumber,
          email,
          city,
          state,
          hospitalName,
          hospitalAddress,
          doctorName,
          reason,
          unitsRequired,
          dateRequired,
          notes,
          requestDate: new Date(),
        },
      ],
    });

    await newRequest.save();
    const io = req.app.get("io");
    if (io) io.emit("requestCreated", newRequest);

    res.status(201).json({
      message: "Blood request created successfully.",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error in createBloodRequest:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//All requests (for dashboards)
exports.getAllBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .select(
        "_id requesterEmail subRequests._id subRequests.patientName subRequests.bloodGroup subRequests.hospitalName subRequests.status subRequests.unitsRequired subRequests.requestDate subRequests.reason subRequests.approvedBy"
      )
      .populate(
        "subRequests.approvedBy.userId",
        "fullName role email phone city donorDetails.bloodGroup"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({ requests });
  } catch (error) {
    console.error("Error in getAllBloodRequests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { parentId, subId } = req.params;
    const { action } = req.body;
    const approverId = req.user.id;
    const approver = await User.findById(approverId);

    const request = await BloodRequest.findById(parentId);
    if (!request)
      return res.status(404).json({ message: "Invalid request reference." });

    const sub = request.subRequests.id(subId);
    if (!sub) return res.status(404).json({ message: "Sub-request not found" });

    if (sub.status === "approved" && action === "approve") {
      return res.status(400).json({ message: "Already approved" });
    }

    sub.status =
      action === "approve"
        ? "approved"
        : action === "fulfill"
        ? "fulfilled"
        : sub.status;

    if (action === "approve") {
      sub.approvedBy = {
        userId: approver._id,
        name: approver.fullName,
        role: approver.role,
        email: approver.email,
        phone: approver.phone,
        city:
          approver.city ||
          approver.hospitalDetails?.city ||
          approver.bloodBankDetails?.city ||
          approver.ngoDetails?.city,
        bloodGroup: approver.donorDetails?.bloodGroup || null,
        address:
          approver.hospitalDetails?.address ||
          approver.bloodBankDetails?.address ||
          approver.ngoDetails?.address ||
          approver.donorDetails?.address ||
          null,
        at: new Date(),
      };
    }

    await request.save();

    const io = req.app.get("io");
    if (io)
      io.emit("bloodRequestUpdated", {
        parentId,
        subId,
        status: sub.status,
        approvedBy: sub.approvedBy,
      });

    res.json({ message: "Status updated successfully", sub });
  } catch (error) {
    console.error("Error in updateRequestStatus:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get my own requests
exports.getMyRequests = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const myRequests = await BloodRequest.find({ requesterId })
      .select(
        "_id requesterEmail subRequests._id subRequests.patientName subRequests.bloodGroup subRequests.hospitalName subRequests.status subRequests.unitsRequired subRequests.requestDate subRequests.reason subRequests.approvedBy"
      )
      .populate(
        "subRequests.approvedBy.userId",
        "fullName role email phone city donorDetails.bloodGroup"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({ requests: myRequests });
  } catch (error) {
    console.error("Error in getMyRequests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//  Get donation history for a donor
exports.getMyDonationHistory = async (req, res) => {
  try {
    const donorId = new mongoose.Types.ObjectId(req.user.id);

    // Fetch only requests that have at least one subRequest approved by donor
    const requests = await BloodRequest.find({
      "subRequests.approvedBy.userId": donorId,
    })
      .select("subRequests")
      .sort({ createdAt: -1 })
      .lean();

    const donations = [];

    requests.forEach((reqDoc) => {
      reqDoc.subRequests.forEach((s) => {
        const match = s.approvedBy?.userId?.toString() === donorId.toString();

        if (match) {
          const approvedAt = s.approvedBy?.at ? new Date(s.approvedBy.at) : new Date(s.requestDate);
          donations.push({
            // Human-friendly
            date: approvedAt.toLocaleDateString("en-IN"),
            // Machine-friendly
            dateISO: approvedAt.toISOString(),
            dateTS: approvedAt.getTime(),
            location: s.hospitalName || s.city || "—",
            bloodType: s.bloodGroup || "—",
            units: s.unitsRequired || 1,
            status: s.status || "approved",
            certificate: false,
          });
        }
      });
    });

    return res.status(200).json({ donations });
  } catch (err) {
    console.error("Error fetching donor history:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Count total requests created by the logged-in user
exports.getMyRequestCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalRequests = await BloodRequest.countDocuments({
      requesterId: userId,
    });
    res.status(200).json({ totalRequests });
  } catch (err) {
    console.error("Error counting requests:", err);
    res.status(500).json({ message: "Failed to count requests" });
  }
};

// ✅ Get top 3 hospitals & blood banks near donor
exports.getNearbyInstitutions = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    if (!donor || !donor.city)
      return res.status(404).json({ message: "City not found for this user" });

    const { city } = donor;

    const hospitals = await User.find({ role: "Hospital", city })
      .select("fullName city hospitalDetails.address")
      .limit(3)
      .lean();

    const bloodBanks = await User.find({ role: "BloodBank", city })
      .select("fullName city bloodBankDetails.address")
      .limit(3)
      .lean();

    res.status(200).json({ hospitals, bloodBanks });
  } catch (err) {
    console.error("Error in getNearbyInstitutions:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get nearby institutions
exports.getNearbyInstitutions = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    if (!donor || !donor.city)
      return res.status(404).json({ message: "City not found for this user" });

    const { city } = donor;

    const hospitals = await User.find({ role: "hospital", city })
      .select("fullName city hospitalDetails.address")
      .limit(3)
      .lean();

    const bloodBanks = await User.find({ role: "blood-bank", city })
      .select("fullName city bloodBankDetails.address")
      .limit(3)
      .lean();

    res.status(200).json({ hospitals, bloodBanks });
  } catch (err) {
    console.error("Error in getNearbyInstitutions:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all institutions
exports.getAllInstitutions = async (req, res) => {
  try {
    const hospitals = await User.find({ role: "hospital" })
      .select("fullName city hospitalDetails.address")
      .lean();

    const bloodBanks = await User.find({ role: "blood-bank" })
      .select("fullName city bloodBankDetails.address")
      .lean();

    res.status(200).json({ hospitals, bloodBanks });
  } catch (err) {
    console.error("Error in getAllInstitutions:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
