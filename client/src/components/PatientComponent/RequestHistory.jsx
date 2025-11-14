import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function RequestHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["polling"],
      reconnection: true,
    });

    socketRef.current.on("bloodRequestUpdated", (data) => {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === data.parentId
            ? {
                ...r,
                subRequests: r.subRequests.map((s) =>
                  s._id === data.subId
                    ? { ...s, status: data.status, approvedBy: data.approvedBy }
                    : s
                ),
              }
            : r
        )
      );
    });

    return () => socketRef.current.disconnect();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8080/api/blood-request/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data.requests)) setRequests(data.requests);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFulfill = async (parentId, subId) => {
    if (!parentId || !subId) return alert("Invalid request reference.");
    try {
      const res = await fetch(
        `http://localhost:8080/api/blood-request/${parentId}/${subId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action: "fulfill" }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setRequests((prev) =>
        prev.map((r) =>
          r._id === parentId
            ? {
                ...r,
                subRequests: r.subRequests.map((s) =>
                  s._id === subId ? { ...s, status: "fulfilled" } : s
                ),
              }
            : r
        )
      );
      alert("Marked as fulfilled!");
    } catch (err) {
      console.error("Fulfill error:", err);
      alert("Failed to mark as fulfilled.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl overflow-hidden shadow-md">
        <div className="bg-red-600 text-white rounded-t-2xl h-20 flex items-center px-8">
          <h1 className="text-3xl font-bold">My Blood Request History</h1>
        </div>

        {loading ? (
          <div className="text-center text-gray-600 mt-10">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-600 mt-10 mb-10">
            No requests found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {requests.map((r) =>
              r.subRequests.map((s) => (
                <div
                  key={s._id}
                  className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-red-600 text-lg">
                      {s.patientName}
                    </h2>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-sm font-semibold">
                      {s.bloodGroup}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm">
                    <strong>Hospital:</strong> {s.hospitalName || "—"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Reason:</strong> {s.reason || "—"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Requested On:</strong>{" "}
                    {new Date(s.requestDate).toLocaleDateString("en-IN")}
                  </p>

                  <p className="text-sm mt-1">
                    <strong>Status:</strong>{" "}
                    {s.status === "approved" ? (
                      <span className="text-green-600 font-semibold">
                        Approved
                      </span>
                    ) : s.status === "fulfilled" ? (
                      <span className="text-blue-600 font-semibold">
                        Fulfilled
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        Pending
                      </span>
                    )}
                  </p>

                  {s.status === "approved" && (
                    <button
                      onClick={() => handleFulfill(r._id, s._id)}
                      className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Mark as Fulfilled
                    </button>
                  )}

                  {s.approvedBy && (
                    <div className="mt-4 bg-gray-50 border rounded-lg p-3 text-sm">
                      <p className="font-semibold text-gray-800 mb-1">
                        Approved By ({s.approvedBy?.role || "—"})
                      </p>
                      <p>
                        <strong>Name:</strong>{" "}
                        {s.approvedBy?.name ||
                          s.approvedBy?.userId?.fullName ||
                          "—"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {s.approvedBy?.email ||
                          s.approvedBy?.userId?.email ||
                          "—"}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {s.approvedBy?.phone ||
                          s.approvedBy?.userId?.phone ||
                          "—"}
                      </p>
                      <p>
                        <strong>City:</strong>{" "}
                        {s.approvedBy?.city ||
                          s.approvedBy?.userId?.city ||
                          "—"}
                      </p>
                      <p>
                        <strong>Blood Group:</strong>{" "}
                        {s.approvedBy?.bloodGroup ||
                          s.approvedBy?.userId?.donorDetails?.bloodGroup ||
                          "—"}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
