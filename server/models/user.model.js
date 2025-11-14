const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, required: true, unique: true },
    phone: String,
    age: Number,
    gender: String,
    city: String,
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["donor", "patient", "hospital", "blood-bank", "ngo"],
      required: true,
    },

    donorDetails: {
      type: {
        bloodGroup: String,
        availableForDonation: { type: Boolean, default: false },
        weight: String,
        lastDonationDate: Date,
        medicalCondition: String,
        idProofType: String,
        idProofNumber: String,
        idProofFile: String,
        address: String,
        state: String,
        pincode: String,
      },
      default: undefined,
    },

    patientDetails: {
      type: {
        idProofType: String,
        idProofNumber: String,
        idProofFile: String,
        address: String,
        state: String,
        pincode: String,
      },
      default: undefined,
    },

    hospitalDetails: {
      type: {
        registrationNumber: String,
        licenseFile: String,
        contactPerson: String,
        hasBloodBank: Boolean,
        address: String,
        state: String,
        pincode: String,
        city: String,
        email: String,
        phone: String,
      },
      default: undefined,
    },

    bloodBankDetails: {
      type: {
        licenseNumber: String,
        contactPerson: String,
        hasBloodBank: Boolean,
        address: String,
        state: String,
        pincode: String,
        city: String,
        email: String,
        phone: String,
      },
      default: undefined,
    },

    ngoDetails: {
      type: {
        registrationNumber: String,
        typeOfWork: String,
        licenseDocument: String,
        contactPerson: String,
        address: String,
        state: String,
        pincode: String,
        city: String,
        email: String,
        phone: String,
      },
      default: undefined,
    },
    
  },
  
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;