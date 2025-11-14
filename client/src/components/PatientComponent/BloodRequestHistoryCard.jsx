import React from "react";

export default function BloodHistoryCard({ data = [] }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full mt-8">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Blood Request History
      </h2>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="p-3 text-left font-semibold">Request ID</th>
              <th className="p-3 text-left font-semibold">Blood</th>
              <th className="p-3 text-left font-semibold">Units</th>
              <th className="p-3 text-left font-semibold">Hospital</th>
              <th className="p-3 text-left font-semibold">Urgency</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Approved By</th>
            </tr>
          </thead>
          <tbody className="bg-white text-gray-700 text-sm">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center text-gray-500 py-6 italic"
                >
                  No blood requests found.
                </td>
              </tr>
            ) : (
              data.map((r, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">{r.requestId}</td>
                  <td className="p-3">{r.bloodGroup}</td>
                  <td className="p-3">{r.unitsRequired}</td>
                  <td className="p-3">{r.hospitalName}</td>
                  <td
                    className={`p-3 font-semibold ${
                      r.urgencyLevel === "critical"
                        ? "text-red-600"
                        : r.urgencyLevel === "emergency"
                        ? "text-orange-600"
                        : "text-gray-700"
                    }`}
                  >
                    {r.urgencyLevel || "Normal"}
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      r.status === "approved"
                        ? "text-green-600"
                        : r.status === "fulfilled"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {r.status}
                  </td>
                  <td className="p-3">{r.approvedBy?.name || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
