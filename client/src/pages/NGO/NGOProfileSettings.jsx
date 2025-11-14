import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, MapPin, ClipboardList } from "lucide-react";
import axios from "axios";
import Navbar from "../../components/NGOComponent/Navbar";
import { useNavigate } from "react-router-dom";

export default function NGOProfileSettings() {
  const [userData, setUserData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.user;
        setUserData(user);
        setOriginalData(JSON.parse(JSON.stringify(user)));
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const ngo = userData?.ngoDetails || {};

  const handleTopLevelChange = (e) => {
    if (!isEditable) return;
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNgoChange = (e) => {
    if (!isEditable) return;
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      ngoDetails: {
        ...prev.ngoDetails,
        [name]: value,
      },
    }));
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
      alert("NGO profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  if (!userData)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">NGO Profile</h2>
        <p className="text-gray-500 mb-8">Manage your NGO information and settings.</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="font-semibold text-lg text-gray-800">{userData.fullName}</h3>
              <p className="text-gray-500 text-sm mb-2">{ngo.email || userData.email}</p>
              {ngo.registrationNumber && (
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                  Reg: {ngo.registrationNumber}
                </span>
              )}
            </div>
            <div className="mt-6 border-t pt-4 text-sm space-y-3">
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-600" /> Work Type
                </span>
                <span>{ngo.typeOfWork || "N/A"}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> City
                </span>
                <span>{ngo.city || userData.city || "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">NGO Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={userData.fullName || ""}
                    onChange={handleTopLevelChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Registration Number</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={ngo.registrationNumber || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Type Of Work</label>
                  <input
                    type="text"
                    name="typeOfWork"
                    value={ngo.typeOfWork || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={ngo.contactPerson || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={ngo.email || userData.email || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={ngo.phone || userData.phone || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={ngo.address || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">City</label>
                  <input
                    type="text"
                    name="city"
                    value={ngo.city || userData.city || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">State</label>
                  <input
                    type="text"
                    name="state"
                    value={ngo.state || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={ngo.pincode || ""}
                    onChange={handleNgoChange}
                    disabled={!isEditable}
                    className={`w-full mt-1 p-2 border rounded-lg ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
              </div>
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
                  className={`px-6 py-2 rounded-lg font-semibold text-white ${isEditable ? "bg-red-500 hover:bg-red-600" : "bg-gray-400 cursor-not-allowed"}`}
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
