import React, { useEffect, useState } from "react";
import Navbar from "../../components/BloodBankComponent/Navbar";
import { getBloodBankAnalytics } from "../../lib/bloodBankApi";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

function BloodBankReports() {
  const [daily, setDaily] = useState([]);
  const [byBlood, setByBlood] = useState([]);
  const [byComponent, setByComponent] = useState([]);
  const [expiry, setExpiry] = useState({ expiredUnits: 0, expiringSoonUnits: 0 });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getBloodBankAnalytics();
        setDaily(data.daily || []);
        setByBlood(data.inventoryDistribution || []);
        setByComponent(data.componentDistribution || []);
        setExpiry(data.expiryStatus || { expiredUnits: 0, expiringSoonUnits: 0 });
      } catch (e) {
        console.error("Reports load error", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h2>

        <section className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Last 14 Days: Donations vs Usage</h3>
            <span className="text-xs text-gray-500">Units</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="donations" stroke="#ef4444" name="Donations" />
              <Line type="monotone" dataKey="usage" stroke="#6366f1" name="Usage" />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Inventory by Blood Group (Balance)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byBlood}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bloodGroup" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="balance" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </section>
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Inventory by Component (Balance)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byComponent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="component" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="balance" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>

        <section className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Expiry Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="text-sm font-medium text-red-700">Expired Units</div>
              <div className="text-2xl font-bold text-red-800 mt-1">{expiry.expiredUnits}</div>
              <div className="text-xs text-red-600">Units currently expired</div>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="text-sm font-medium text-yellow-700">Expiring Soon (7d)</div>
              <div className="text-2xl font-bold text-yellow-800 mt-1">{expiry.expiringSoonUnits}</div>
              <div className="text-xs text-yellow-700">Units expiring in next 7 days</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default BloodBankReports;
