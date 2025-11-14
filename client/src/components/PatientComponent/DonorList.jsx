import React from "react";
import { MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DonorList = ({ donors = [] }) => {
  const navigate = useNavigate();

  return (
    <section className="mt-8 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Matched Donors
        </h3>

        {/* ✅ Link to full donor list */}
        <button
          onClick={() => navigate("/patient/approved-donors")}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          View all donors
        </button>
      </div>

      {donors.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">
          No donors found in your area.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {donors.map((donor) => (
            <div
              key={donor._id || donor.id}
              className="border rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition"
            >
              <User className="w-12 h-12 text-red-500 mb-4" />
              <p className="font-semibold text-gray-800">
                {donor.fullName || "Unknown"}
              </p>
              <p className="text-sm text-gray-600">
                Blood Type:{" "}
                {donor?.donorDetails?.bloodGroup ||
                  donor.bloodGroup ||
                  "N/A"}
              </p>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                {donor.city || "Unknown"}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DonorList;
