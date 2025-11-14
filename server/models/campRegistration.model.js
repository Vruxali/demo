const mongoose = require("mongoose");

const CampRegistrationSchema = new mongoose.Schema(
  {
    campId: { type: mongoose.Schema.Types.ObjectId, ref: "Camp", required: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // NGO who owns the camp
    type: { type: String, enum: ["donor", "volunteer"], required: true },
    registrantUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    city: { type: String },
    bloodGroup: { type: String }, // donors primarily
    availability: { type: String }, // volunteers primarily
    notes: { type: String },
  },
  { timestamps: true }
);

CampRegistrationSchema.index({ campId: 1 });
CampRegistrationSchema.index({ orgId: 1, type: 1 });
// Ensure a user can't register twice for the same camp (donor/volunteer or both)
CampRegistrationSchema.index(
  { campId: 1, registrantUserId: 1 },
  { unique: true, partialFilterExpression: { registrantUserId: { $exists: true, $ne: null } } }
);

module.exports = mongoose.model("CampRegistration", CampRegistrationSchema);
