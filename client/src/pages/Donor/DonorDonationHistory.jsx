import React, { useEffect, useState } from "react";
import { Droplet, Calendar } from "lucide-react";
import Navbar from "../../components/DonorComponent/Navbar";

const DonorDonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    nextEligibleDate: "N/A",
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "http://localhost:8080/api/blood-request/my-donations",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (Array.isArray(data.donations)) {
          setDonations(data.donations);
          const total = data.donations.length;

          let nextDate = "N/A";

          if (total > 0) {
            // Prefer machine-friendly fields
            const sortedDonations = [...data.donations].sort((a, b) => {
              const aTS = typeof a.dateTS === 'number' ? a.dateTS : (a.dateISO ? Date.parse(a.dateISO) : Date.parse(a.date));
              const bTS = typeof b.dateTS === 'number' ? b.dateTS : (b.dateISO ? Date.parse(b.dateISO) : Date.parse(b.date));
              return (bTS || 0) - (aTS || 0);
            });

            const top = sortedDonations[0];
            const ts = typeof top.dateTS === 'number' ? top.dateTS : (top.dateISO ? Date.parse(top.dateISO) : Date.parse(top.date));

            if (ts) {
              const eligibleDate = new Date(ts + 90 * 24 * 60 * 60 * 1000);
              nextDate = eligibleDate.toLocaleDateString('en-IN');
            }
          }

          setStats({
            totalDonations: total,
            nextEligibleDate: nextDate,
          });
        }
      } catch (err) {
        console.error("Error loading donation history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <h1 className="text-3xl font-bold text-center mt-10 mb-2 text-gray-800">
        Your Donation Journey
      </h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Every donation you make saves lives and inspires hope. Track your
        journey and celebrate your generosity.
      </p>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 mb-8 mx-40 gap-10 text-center">
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center">
          <Droplet className="text-red-500 mb-2" size={28} />
          <h2 className="text-3xl font-semibold">{stats.totalDonations}</h2>
          <p className="text-gray-500 text-sm">Total Donations</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center">
          <Calendar className="text-blue-500 mb-2" size={28} />
          <h2 className="text-xl font-semibold text-blue-600">
            {stats.nextEligibleDate}
          </h2>
          <p className="text-gray-500 text-sm">Next Eligible Date</p>
        </div>
      </div>

      {/* Donation Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm overflow-x-auto mx-10 mb-8">
        <h2 className="text-lg font-semibold mb-4">Donation History</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading donations...</p>
        ) : donations.length === 0 ? (
          <p className="text-center text-gray-400 py-4">
            No donation history available
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Location</th>
                  <th className="py-3 px-4 text-left">Blood Type</th>
                  <th className="py-3 px-4 text-center w-32">Units Donated</th>
                  <th className="py-3 px-4 text-center w-32">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {donations.map((d, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4">{d.date}</td>
                    <td className="py-3 px-4">{d.location}</td>
                    <td className="py-3 px-4 font-semibold text-red-500">
                      {d.bloodType}
                    </td>

                    {/* Units Donated */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-600 font-semibold text-xs shadow-sm border border-red-100">
                        {d.units || 1}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${
                          d.status === "fulfilled"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : d.status === "pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {d.status === "fulfilled"
                          ? "Fulfilled"
                          : d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDonationHistory;
