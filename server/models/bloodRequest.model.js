const mongoose = require("mongoose");
const { Schema } = mongoose;

const approvedBySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  name: String,
  role: String,
  email: String,
  phone: String,
  city: String,
  bloodGroup: String,
  address: String,
  at: Date,
});

const decisionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  role: String,
  action: String,
  at: Date,
});

const subRequestSchema = new Schema({
  patientName: String,
  age: Number,
  gender: String,
  bloodGroup: String,
  contactNumber: String,
  email: String,
  city: String,
  state: String,
  hospitalName: String,
  hospitalAddress: String,
  doctorName: String,
  reason: String,
  unitsRequired: Number,
  dateRequired: Date,
  notes: String,
  requestDate: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
  approvedBy: approvedBySchema,
  decisions: [decisionSchema],
});

const bloodRequestSchema = new Schema(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: "User" },
    requesterEmail: String,
    subRequests: [subRequestSchema],
  },
  { timestamps: true }
);

// Fast queries
bloodRequestSchema.index({ requesterId: 1 });
bloodRequestSchema.index({ "subRequests.approvedBy.userId": 1 });
bloodRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
