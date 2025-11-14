import React, { useState, useEffect } from "react";
import { User, CalendarHeart } from "lucide-react";
import axios from "axios";
import Navbar from "../../components/PatientComponent/Navbar";
import { useNavigate } from "react-router-dom";

export default function PatientProfileSettings() {
  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const [userData, setUserData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);

  // ✅ Fetch patient data and total request count once on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData({
          fullName: res.data.user.fullName || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          age: res.data.user.age || "",
          gender: res.data.user.gender || "",
          city: res.data.user.city || "",
          state: res.data.user.state || "",
          pincode: res.data.user.pincode || "",
          patientDetails: res.data.user.patientDetails || {},
        });

        setOriginalData(JSON.parse(JSON.stringify(res.data.user)));
      } catch (err) {
        console.error("Failed to load patient data:", err);
      }
    };

    const fetchRequestCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/blood-request/my-request-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalRequests(res.data.totalRequests || 0);
      } catch (err) {
        console.error("Failed to fetch total requests:", err);
      }
    };

    fetchProfile();
    fetchRequestCount();
  }, []);

  const handleChange = (e) => {
    if (!isEditable) return;
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setUserData(JSON.parse(JSON.stringify(originalData)));
    setIsEditable(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "http://localhost:8080/api/user/update",
        { ...userData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOriginalData(JSON.parse(JSON.stringify(userData)));
      setIsEditable(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!userData)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );

  const patient = userData.patientDetails || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Profile & Settings</h2>
        <p className="text-gray-500 mb-8">Manage your personal and medical information.</p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <User className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="font-semibold text-lg text-gray-800">{userData.fullName}</h3>
              <p className="text-gray-500 text-sm mb-2">{userData.email}</p>
            </div>

            <div className="mt-6 border-t pt-4 text-sm space-y-3">
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  <CalendarHeart className="w-4 h-4 text-blue-500" /> Recent Requests
                </span>
                <span>{totalRequests}</span>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Personal Information
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={userData.fullName || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${
                      !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm text-gray-600">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${
                      !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm text-gray-600">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={userData.phone || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${
                      !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="text-sm text-gray-600">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={userData.age ?? ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${
                      !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    min={1}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-sm text-gray-600">Gender</label>
                  <select
                    name="gender"
                    value={userData.gender || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${
                      !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="text-sm text-gray-600">City</label>
                  <input
                    type="text"
                    name="city"
                    value={userData.city || ""}
                    onChange={handleChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${
                      !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={patient.address || ""}
                    onChange={(e) => {
                      if (!isEditable) return;
                      setUserData((prev) => ({
                        ...prev,
                        patientDetails: {
                          ...prev.patientDetails,
                          address: e.target.value,
                        },
                      }));
                    }}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${
                      !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={isEditable ? handleCancel : () => setIsEditable(true)}
                  className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100"
                >
                  {isEditable ? "Cancel" : "Edit"}
                </button>

                <button
                  type="submit"
                  disabled={!isEditable}
                  className={`px-6 py-2 rounded-lg font-semibold text-white ${
                    isEditable
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-lg font-semibold text-red-600 border border-red-600 bg-white hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
