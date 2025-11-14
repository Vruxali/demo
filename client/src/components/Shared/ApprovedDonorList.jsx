import React, { useEffect, useState, useMemo } from "react";

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function ApprovedDonorList() {
  const [donors, setDonors] = useState([]);
  const [cities, setCities] = useState(["All"]);
  const [filters, setFilters] = useState({ city: "All", bloodGroup: "All" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const query = new URLSearchParams();
      if (filters.city !== "All") query.append("city", filters.city);
      if (filters.bloodGroup !== "All")
        query.append("bloodGroup", filters.bloodGroup);

      const res = await fetch(
        `http://localhost:8080/api/user/approved-donors?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      console.log("Fetched donors:", data);

      const donorArray = Array.isArray(data?.donors)
        ? data.donors
        : Array.isArray(data)
        ? data
        : [];

      setDonors(donorArray);

      const uniqueCities = [
        "All",
        ...new Set(donorArray.map((d) => d?.city).filter(Boolean)),
      ];
      setCities(uniqueCities);
    } catch (err) {
      console.error("Error fetching donors:", err);
      setError("Failed to load donors. Try again later.");
      setDonors([]);
      setCities(["All"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
    // eslint-disable-next-line
  }, [filters]);

  const filteredDonors = useMemo(() => {
    if (!Array.isArray(donors)) return [];
    return donors.filter((donor) => {
      const cityMatch =
        filters.city === "All" || donor.city === filters.city;
      const bloodMatch =
        filters.bloodGroup === "All" ||
        donor?.donorDetails?.bloodGroup === filters.bloodGroup;
      return cityMatch && bloodMatch;
    });
  }, [donors, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-red-600 text-white rounded-t-2xl p-6 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Approved Donors</h1>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-b-2xl shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between mt-1">
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                disabled={loading}
                className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-red-500 outline-none transition"
              >
                {(cities || []).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={filters.bloodGroup}
                onChange={handleFilterChange}
                disabled={loading}
                className="border border-gray-300 rounded-lg px-3 py-2 w-40 focus:ring-2 focus:ring-red-500 outline-none transition"
              >
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchDonors}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center text-red-600 mt-4">{error}</div>
        )}

        {/* Donor List */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center text-gray-500 mt-10">Loading donors...</div>
          ) : filteredDonors.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              No donors found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonors.map((d) => (
                <div
                  key={d?._id || Math.random()}
                  className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-bold text-lg text-gray-800">
                      {d?.fullName || "Unknown"}
                    </h2>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-sm font-semibold">
                      {d?.donorDetails?.bloodGroup || "N/A"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    <strong>City:</strong> {d?.city || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Gender:</strong> {d?.gender || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Age:</strong> {d?.age || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {d?.phone || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {d?.email || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
