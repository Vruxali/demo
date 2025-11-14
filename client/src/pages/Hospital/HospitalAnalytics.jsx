import React, { useEffect, useState } from "react";
import Navbar from "../../components/HospitalComponent/Navbar";
import api from "../../lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#dc2626", "#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0d9488", "#991b1b", "#1e40af"];

function HospitalAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/hospital/analytics-data");
      setData(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hospital Analytics</h1>
            <p className="text-sm text-gray-600">Operational and blood inventory insights</p>
          </div>
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading && <div className="text-gray-500">Loading analytics...</div>}
        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}
        {!loading && data && (
          <div className="space-y-8">
            {/* Top KPIs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Donation Units Received</p>
                <p className="text-2xl font-semibold text-red-600">{data.donationsVsIssues.donations}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Units Issued</p>
                <p className="text-2xl font-semibold text-blue-600">{data.donationsVsIssues.issues}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Expired Units</p>
                <p className="text-2xl font-semibold text-gray-700">{data.expiryStatus.expiredUnits}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <p className="text-xs text-gray-500">Expiring Soon (7d)</p>
                <p className="text-2xl font-semibold text-yellow-600">{data.expiryStatus.expiringSoonUnits}</p>
              </div>
            </div>

            {/* Requests Trend */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Approved Requests Trend (14 days)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyRequests} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory Distribution */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Inventory Balance by Blood Group</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.inventoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bloodGroup" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="balance" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Component Distribution */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Component Balance</h2>
              <div className="h-72 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.componentDistribution}
                      dataKey="balance"
                      nameKey="component"
                      outerRadius={110}
                      label={({ percent, component }) => `${component}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.componentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donations vs Issues Comparison */}
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Donation vs Issued Units</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[data.donationsVsIssues]}>
                    <XAxis dataKey={() => "Totals"} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="donations" fill="#dc2626" name="Donations" radius={[4,4,0,0]} />
                    <Bar dataKey="issues" fill="#2563eb" name="Issues" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <p className="text-xs text-gray-400">Generated at: {new Date(data.generatedAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalAnalytics;
