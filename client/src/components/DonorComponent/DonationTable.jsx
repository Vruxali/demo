import React from "react";

const DonationTable = ({ donations = [] }) => {
  if (!donations || donations.length === 0)
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md text-center text-gray-400 border border-gray-100">
        No donations yet.
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 md:p-6">
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="py-4 px-6 text-left">Date</th>
              <th className="py-4 px-6 text-left">Location</th>
              <th className="py-4 px-6 text-left">Blood Type</th>
              <th className="py-4 px-6 text-center w-32">Units Donated</th>
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

                {/* Units Donated */}
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50 text-red-600 font-semibold text-sm shadow-sm border border-red-100">
                    {d.units || 1}
                  </span>
                </td>

                {/* Status */}
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
                      : d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationTable;
