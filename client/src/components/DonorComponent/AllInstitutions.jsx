import React, { useEffect, useState } from "react";
import axios from "axios";
import HospitalCard from "./HospitalCard";

export default function AllInstitutions() {
  const [data, setData] = useState({ hospitals: [], bloodBanks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/api/blood-request/all-institutions", {
          headers: { Authorization: `Bearer ${token}` },
        });
1

        const hospitals = Array.isArray(res.data.hospitals)
          ? res.data.hospitals
          : [];
        const bloodBanks = Array.isArray(res.data.bloodBanks)
          ? res.data.bloodBanks
          : [];

        setData({ hospitals, bloodBanks });
      } catch (err) {
        console.error("Error fetching all institutions:", err);
        setData({ hospitals: [], bloodBanks: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-8 text-gray-800 text-center">
        All Hospitals & Blood Banks
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading institutions...</p>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Hospitals Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Hospitals
            </h2>
            {data.hospitals.length === 0 ? (
              <p className="text-center text-gray-500">No hospitals found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                {data.hospitals.map((item, i) => (
                  <HospitalCard
                    key={i}
                    name={item.fullName}
                    distance={item.city}
                    address={item.hospitalDetails?.address || "Address not available"}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Blood Banks Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
              Blood Banks
            </h2>
            {data.bloodBanks.length === 0 ? (
              <p className="text-center text-gray-500">No blood banks found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
                {data.bloodBanks.map((item, i) => (
                  <HospitalCard
                    key={i}
                    name={item.fullName}
                    distance={item.city}
                    address={item.bloodBankDetails?.address || "Address not available"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
