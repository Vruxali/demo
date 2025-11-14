import React, { useEffect, useState } from "react";
import Navbar from "../../components/HospitalComponent/Navbar";
import Card from "../../components/HospitalComponent/Card";
import api from "../../lib/api";

const HospitalDashboard = () => {
  const [user, setUser] = useState({});
  const [availableBlood, setAvailableBlood] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/hospital/dashboard-data");
        setUser(data.user || {});
        setAvailableBlood(data.bloodInventory || []);
        setRequests(data.pendingRequests || []);
        setStats(data.stats || {});
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto p-4 mt-6 space-y-6">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.hospitalName || "Hospital"}!
        </h1>
        <p className="text-gray-600">
          Manage your blood inventory, requests, and donation stats.
        </p>

        {/* Stats Section */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-gray-500 text-sm">Total Donations</p>
            <p className="text-3xl font-bold text-blue-700">{stats?.totalDonations || 0}</p>
          </Card>

          <Card>
            <p className="text-gray-500 text-sm">Pending Requests</p>
            <p className="text-3xl font-bold text-red-600">{stats?.pendingRequests || 0}</p>
          </Card>

          <Card>
            <p className="text-gray-500 text-sm">Available Units</p>
            <p className="text-3xl font-bold text-green-600">{stats?.availableUnits || 0}</p>
          </Card>

          <Card>
            <p className="text-gray-500 text-sm">Approved Requests</p>
            <p className="text-3xl font-bold text-purple-600">{stats?.approvedRequests || 0}</p>
          </Card>
        </div>

        {/* Blood Inventory */}
        <Card title="Blood Inventory">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Blood Type</th>
                  <th className="py-2 px-4 text-left">Units Available</th>
                  <th className="py-2 px-4 text-left">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {availableBlood.length > 0 ? (
                  availableBlood.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-4">{item.bloodType}</td>
                      <td className="py-2 px-4">{item.units}</td>
                      <td className="py-2 px-4">{item.updatedAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pending Requests */}
        <Card title="Pending Blood Requests">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Requester</th>
                  <th className="py-2 px-4 text-left">Blood Type</th>
                  <th className="py-2 px-4 text-left">Quantity</th>
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-4">{req.requesterName}</td>
                      <td className="py-2 px-4">{req.bloodType}</td>
                      <td className="py-2 px-4">{req.quantity}</td>
                      <td className="py-2 px-4">{req.date}</td>
                      <td
                        className={`py-2 px-4 font-semibold ${
                          req.status === "Pending"
                            ? "text-yellow-500"
                            : "text-green-600"
                        }`}
                      >
                        {req.status}
                      </td>
                      <td className="py-2 px-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs">
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-500">
                      No pending requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HospitalDashboard;
