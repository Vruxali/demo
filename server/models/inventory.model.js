const mongoose = require("mongoose");

const InventoryEntrySchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orgRole: { type: String, enum: ["hospital", "blood-bank"], required: true },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    componentType: {
      type: String,
      enum: ["Whole Blood", "RBC", "Plasma", "Platelets"],
      default: "Whole Blood",
    },
    units: { type: Number, min: 1, required: true },

    sourceType: {
      type: String,
      enum: ["Donation", "Purchase", "Transfer", "Camp"],
      required: true,
    },
    sourceName: { type: String, default: "" },
    sourceRefId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    collectionDate: { type: Date },
    receivedDate: { type: Date, required: true },
    expiryDate: { type: Date },
    storageLocation: { type: String, default: "" },
    notes: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const InventoryIssueSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orgRole: { type: String, enum: ["hospital", "blood-bank"], required: true },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    componentType: {
      type: String,
      enum: ["Whole Blood", "RBC", "Plasma", "Platelets"],
      default: "Whole Blood",
    },
    units: { type: Number, min: 1, required: true },

    issuedToType: {
      type: String,
      enum: ["Patient", "Hospital", "NGO", "Donor"],
      required: true,
    },
    issuedToName: { type: String, default: "" },
    issuedToRefId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requestRefId: { type: mongoose.Schema.Types.ObjectId, ref: "BloodRequest" },

    issuedDate: { type: Date, required: true },
    notes: { type: String, default: "" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const InventoryEntry = mongoose.model("InventoryEntry", InventoryEntrySchema);
const InventoryIssue = mongoose.model("InventoryIssue", InventoryIssueSchema);

module.exports = { InventoryEntry, InventoryIssue };
