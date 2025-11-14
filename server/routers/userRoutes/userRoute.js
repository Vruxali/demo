const express = require("express");
const { userInsert, userLogin } = require("../../controllers/Users/userController.js");
const upload = require("../../middleware/uploadProof.js");
const { verifyToken } = require("../../middleware/auth.js");
const userModel = require("../../models/user.model.js");

const userRouter = express.Router();

// Register
userRouter.post(
  "/register",
  upload.fields([
    { name: "idProofFile", maxCount: 1 },
    { name: "licenseFile", maxCount: 1 },
    { name: "licenseDocument", maxCount: 1 },
  ]),
  userInsert
);

// Login
userRouter.post("/login", userLogin);

// Get logged-in user
userRouter.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// Update profile
userRouter.put("/update", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const allowedBaseFields = [
      "fullName",
      "phone",
      "age",
      "gender",
      "city",
      "state",
      "pincode",
    ];

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    allowedBaseFields.forEach((field) => {
      if (updates[field] !== undefined) user[field] = updates[field];
    });

    const detailKey = `${user.role}Details`;
    if (updates[detailKey]) {
      user[detailKey] = { ...user[detailKey], ...updates[detailKey] };
    }

    const updatedUser = await user.save();
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});

// Get approved donors (filtered) for Donor List [hospital, Bloodbank]
userRouter.get("/approved-donors", verifyToken, async (req, res) => {
  try {
    const { city, bloodGroup } = req.query;

    // Filter only donors
    const query = { role: "donor" };

    if (city && city !== "All") query.city = city;
    if (bloodGroup && bloodGroup !== "All")
      query["donorDetails.bloodGroup"] = bloodGroup;

    console.log("Donor Query:", query);

    const donors = await userModel.find(query).select("-password");

    // Always send array
    res.status(200).json({
      donors: Array.isArray(donors) ? donors : [],
    });
  } catch (err) {
    console.error("Error fetching donors:", err.message);
    res.status(500).json({ donors: [], message: "Error fetching donors" });
  }
});

//Get approved donors filtered by city
userRouter.get("/approved-donors", verifyToken, async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { role: "donor", "donorDetails.availableForDonation": true };
    if (city) filter.city = city;

    const donors = await User.find(filter)
      .select("fullName city age gender phone email donorDetails.bloodGroup")
      .limit(3);

    res.json({ donors });
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});





module.exports = userRouter;
