import React, { useEffect, useState } from "react";
import Navbar from "../../components/PatientComponent/Navbar";
import UrgentRequestCard from "../../components/PatientComponent/UrgentRequestCard";
import BloodRequestHistoryCard from "../../components/PatientComponent/BloodRequestHistoryCard";
import DonorList from "../../components/PatientComponent/DonorList";

const PatientDashboard = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [bloodRequests, setBloodRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // ✅ Fetch top 3 recent blood requests for logged-in patient
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/blood-request/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (Array.isArray(data.requests)) {
        const allSubs = data.requests.flatMap((r) => r.subRequests || []);
        const sorted = allSubs.sort(
          (a, b) => new Date(b.requestDate) - new Date(a.requestDate)
        );
        // keep only top 3
        setBloodRequests(sorted.slice(0, 3).map((req) => ({
          patientName: req.patientName || "Unknown",
          bloodGroup: req.bloodGroup || "N/A",
          hospitalName: req.hospitalName || "—",
          unitsRequired: req.unitsRequired || "—",
          status: req.status || "Pending",
          requestDate: req.requestDate || new Date(),
        })));
      }
    } catch (err) {
      console.error("Error fetching blood requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch top 3 donors in same city
  const fetchDonors = async () => {
    try {
      const city = user?.city || "";
      const res = await fetch(
        `http://localhost:8080/api/user/approved-donors?city=${city}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data.donors)) setDonors(data.donors.slice(0, 3));
    } catch (err) {
      console.error("Error fetching donors:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchDonors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto p-4">
        {/* Urgent Request Card */}
        <UrgentRequestCard />

        {/* ✅ Blood Request History (Top 3 Requests) */}
        <section className="bg-white rounded-2xl shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Recent Blood Requests
          </h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : bloodRequests.length === 0 ? (
            <p className="text-gray-500 text-sm">No requests found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bloodRequests.map((req, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-gray-50"
                >
                  <h3 className="font-semibold text-red-600 text-lg mb-2">
                    {req.patientName}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong>Blood Group:</strong> {req.bloodGroup}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Hospital:</strong> {req.hospitalName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Units Required:</strong> {req.unitsRequired}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Status:</strong>{" "}
                    {req.status === "fulfilled" ? (
                      <span className="text-blue-600 font-medium">Fulfilled</span>
                    ) : req.status === "approved" ? (
                      <span className="text-green-600 font-medium">Approved</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Pending</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Requested on:{" "}
                    {new Date(req.requestDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ✅ Donor List */}
        <DonorList donors={donors} />
      </main>
    </div>
  );
};

export default PatientDashboard;
