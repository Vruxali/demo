import Navbar from "../../components/DonorComponent/Navbar";
import HospitalCard from "../../components/DonorComponent/HospitalCard";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const navigate = useNavigate();

  // 1️⃣ Load user immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("User fetch failed:", err);
        localStorage.clear();
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // 2️⃣ Load donations and institutions after user exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    const fetchDashboardData = async () => {
      try {
        // Run both requests in parallel
        const [resDon, resInst] = await Promise.allSettled([
          axios.get("http://localhost:8080/api/blood-request/my-donations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/blood-request/nearby-institutions", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // ✅ Donations
        if (resDon.status === "fulfilled") {
          const donationsData = Array.isArray(resDon.value.data.donations)
            ? resDon.value.data.donations
            : [];
          setDonations(donationsData.slice(0, 3));
        } else {
          console.warn("Donations not fetched");
        }

        // ✅ Institutions
        if (resInst.status === "fulfilled") {
          const { hospitals = [], bloodBanks = [] } = resInst.value.data || {};
          const combined = [...hospitals, ...bloodBanks];
          setInstitutions(combined.slice(0, 3));
        } else {
          console.warn("Institutions not fetched");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        // ✅ Always clear loading flags
        setLoadingInstitutions(false);
        setLoadingDonations(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user)
    return <div className="p-8 text-center text-gray-600">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-6 md:p-10">
        {/* Welcome */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          Welcome back, {user.fullName}!
        </h2>
        <p className="text-gray-500 mb-6">
          Thank you for being a lifesaver, {user.fullName.split(" ")[0]}. Every
          drop you give makes a difference.
        </p>

        {/* 🏥 Hospitals Section */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">
              Nearby Hospitals & Blood Banks
            </h3>
            <span
              onClick={() => navigate("/donor/all-institutions")}
              className="text-blue-600 text-sm cursor-pointer hover:underline"
            >
              View all →
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loadingInstitutions ? (
              <p className="text-gray-500 text-center col-span-3 py-4">
                Fetching nearby institutions...
              </p>
            ) : institutions.length === 0 ? (
              <p className="text-gray-500 text-center col-span-3 py-4">
                No hospitals or blood banks found in your city.
              </p>
            ) : (
              institutions.map((inst, i) => (
                <HospitalCard
                  key={i}
                  name={inst.fullName}
                  distance={inst.city}
                  address={
                    inst.hospitalDetails?.address ||
                    inst.bloodBankDetails?.address ||
                    "Address not available"
                  }
                  status="Verified Institution"
                />
              ))
            )}
          </div>
        </section>

        {/* 🩸 Donation History Section */}
        <section className="mt-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">
              Recent Donation History
            </h3>
            <span
              onClick={() => navigate("/donor/history")}
              className="text-blue-600 text-sm cursor-pointer hover:underline"
            >
              View All →
            </span>
          </div>

          {loadingDonations ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Fetching donation history...
            </p>
          ) : donations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No donations yet.
            </p>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full text-sm text-gray-700">
                  <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="py-4 px-6 text-left">Date</th>
                      <th className="py-4 px-6 text-left">Location</th>
                      <th className="py-4 px-6 text-left">Blood Type</th>
                      <th className="py-4 px-6 text-center w-32">
                        Units Donated
                      </th>
                      <th className="py-4 px-6 text-center w-32">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {donations.map((d, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-all duration-150"
                      >
                        <td className="py-4 px-6">{d.date}</td>
                        <td className="py-4 px-6">{d.location}</td>
                        <td className="py-4 px-6 font-semibold text-red-500">
                          {d.bloodType}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 font-semibold text-sm shadow-sm border border-red-100">
                            {d.units || 1}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${
                              d.status === "fulfilled"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : d.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {d.status === "fulfilled"
                              ? "Fulfilled"
                              : d.status.charAt(0).toUpperCase() +
                                d.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DonorDashboard;
