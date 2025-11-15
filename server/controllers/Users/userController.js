const userModel = require("../../models/user.model");
const axios = require("axios");
const jwt = require("jsonwebtoken"); //
// const bcrypt = require("bcryptjs"); // uncomment later for hashing

// ====================== REGISTER CONTROLLER ======================
const roleFieldMap = {
  donor: [
    "bloodGroup",
    "weight",
    "disease",
    "lastDonationDate",
    "availableForDonation",
    "medicalCondition",
    "idProofType",
    "idProofNumber",
    "idProofFile",
    "address",
    "state",
    "pincode",
  ],
  patient: [
    "idProofType",
    "idProofNumber",
    "idProofFile",
    "address",
    "state",
    "pincode",
  ],
  hospital: [
    "registrationNumber",
    "licenseFile",
    "hasBloodBank",
    "contactPerson",
    "address",
    "state",
    "pincode",
  ],
  "blood-bank": [
    "licenseNumber",
    "hasBloodBank",
    "contactPerson",
    "address",
    "state",
    "pincode",
  ],
  ngo: [
    "registrationNumber",
    "typeOfWork",
    "licenseDocument",
    "contactPerson",
    "address",
    "state",
    "pincode",
  ],
};

const userInsert = async (req, res) => {
  try {
    const { fullName, email, phone, age, gender, city, password, role } =
      req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // ===== Optional: Government Verification Logic =====
    if (["hospital", "blood-bank", "ngo"].includes(role)) {
      let orgName = fullName;
      let licenseNumber;
      let type;

      if (role === "hospital") {
        licenseNumber = req.body.registrationNumber;
        type = "hospital";
      } else if (role === "blood-bank") {
        licenseNumber = req.body.licenseNumber;
        type = "blood-bank";
      } else if (role === "ngo") {
        licenseNumber = req.body.registrationNumber;
        type = "ngo";
      }

      if (!orgName || !licenseNumber) {
        return res
          .status(400)
          .json({
            message:
              "Organization name and license/registration number required.",
          });
      }

      try {
        const govRes = await axios.post("http://localhost:4000/api/verify", {
          type,
          name: orgName,
          licenseNumber,
        });

        if (!govRes.data.verified) {
          return res
            .status(403)
            .json({
              message:
                "Your organization is not verified in the government database.",
            });
        }
      } catch (err) {
        return res
          .status(500)
          .json({
            message: "Error verifying with government API.",
            error: err.message,
          });
      }
    }

    const userData = {
      fullName,
      email,
      phone,
      age,
      gender,
      city,
      password,
      role,
    };

    const allowedFields = roleFieldMap[role];
    if (!allowedFields) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const files = req.files || {};
    let detailObject = {};
    for (const field of allowedFields) {
      if (
        (field === "idProofFile" && files.idProofFile) ||
        (field === "licenseFile" && files.licenseFile) ||
        (field === "licenseDocument" && files.licenseDocument)
      ) {
        detailObject[field] = files[field][0].path;
      } else if (req.body[field]) {
        let value = req.body[field];
        if (
          (field === "availableForDonation" || field === "hasBloodBank") &&
          typeof value === "string"
        ) {
          value = value.toLowerCase() === "yes";
        }
        // Convert weight to number for donors
        if (field === "weight" && typeof value === "string") {
          value = Number(value);
        }
        detailObject[field] = value;
      }
    }

    // ===== Donor Eligibility Validation =====
    if (role === "donor") {
      const weight = Number(req.body.weight);
      const disease = req.body.disease || "";

      // Weight validation
      if (!weight || weight < 45) {
        return res.status(400).json({ 
          message: "Sorry, you are underweight. Minimum weight required is 45 kg. You are not eligible to donate blood." 
        });
      }

      // Disease validation
      const ineligibleDiseases = ["Cancer", "HIV", "Hepatitis B", "Hepatitis C", "Cardiac Condition", "Diabetes", "Hypertension"];
      if (disease && disease !== "Fully Fit" && ineligibleDiseases.includes(disease)) {
        return res.status(400).json({ 
          message: `You are not eligible for donation due to: ${disease}. Please consult with a medical professional.` 
        });
      }
    }

    if (Object.keys(detailObject).length > 0) {
      switch (role) {
        case "donor":
          userData.donorDetails = detailObject;
          break;
        case "patient":
          userData.patientDetails = detailObject;
          break;
        case "hospital":
          userData.hospitalDetails = detailObject;
          break;
        case "blood-bank":
          userData.bloodBankDetails = detailObject;
          break;
        case "ngo":
          userData.ngoDetails = detailObject;
          break;
      }
    }

    const newUser = new userModel(userData);
    const savedUser = await newUser.save();

    global._io.emit("userRegistered", newUser);

    res.status(201).json({
      message: "User created successfully!",
      data: savedUser,
    });
  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(400).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

// ====================== LOGIN CONTROLLER ======================
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    const existingUser = await userModel.findOne({ email });
    if (!existingUser)
      return res
        .status(404)
        .json({ message: "User not found! Please register first." });

    //TODO: Replace with bcrypt.compare(password, existingUser.password)
    if (existingUser.password !== password)
      return res.status(401).json({ message: "Incorrect password!" });

    const token = jwt.sign(
      { id: existingUser._id, role: existingUser.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    // Return trimmed user data (safe to store client-side)
    const userData = {
      _id: existingUser._id,
      fullName: existingUser.fullName,
      email: existingUser.email,
      role: existingUser.role,
      //city fallback from nested org details if top-level city is empty
      city:
        existingUser.city ||
        existingUser?.donorDetails?.city ||
        existingUser?.hospitalDetails?.city ||
        existingUser?.bloodBankDetails?.city ||
        existingUser?.ngoDetails?.city ||
        "",
      phone: existingUser.phone,
    };
    return res.status(200).json({
      message: "Login successful!",
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = { userInsert, userLogin };
