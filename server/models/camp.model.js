const mongoose = require("mongoose");

const campSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orgRole: { type: String, enum: ["ngo"], required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    organizerName: { type: String, default: "" },
    expectedDonors: { type: Number, min: 0, default: 0 },
    startDateTime: { type: Date, required: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["upcoming","completed","cancelled"], default: "upcoming" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

campSchema.index({ orgId: 1, startDateTime: -1 });

module.exports = mongoose.model("Camp", campSchema);
