import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    socketRef.current = io("http://localhost:8080", {
      transports: ["polling"],
      reconnection: true,
    });

    socketRef.current.on("requestCreated", (newReq) => {
      setRequests((prev) => [newReq, ...prev]);
    });

    socketRef.current.on("bloodRequestUpdated", (data) => {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === data.parentId
            ? {
                ...r,
                subRequests: r.subRequests.map((s) =>
                  s._id === data.subId
                    ? {
                        ...s,
                        status: data.status,
                        approvedBy: data.approvedBy,
                      }
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
      const res = await fetch("http://localhost:8080/api/blood-request", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data.requests)) {
        setRequests(
          data.requests.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (parentId, subId, action) => {
    try {
      console.log("Parent:", parentId, "Sub:", subId); // for debug
      const res = await fetch(
        `http://localhost:8080/api/blood-request/${parentId}/${subId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Error updating status");
      setRequests((prev) =>
        prev.map((r) =>
          r._id === parentId
            ? {
                ...r,
                subRequests: r.subRequests.map((s) =>
                  s._id === subId
                    ? {
                        ...s,
                        status: data.sub.status,
                        approvedBy: data.sub.approvedBy,
                      }
                    : s
                ),
              }
            : r
        )
      );
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl overflow-hidden">
        <div className="bg-red-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold">Manage Blood Requests</h1>
        </div>

        <div className="overflow-x-auto mt-1">
          {loading ? (
            <div className="text-center py-10 text-gray-600">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              No requests found.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Patient</th>
                  <th className="px-4 py-2 text-left">Blood</th>
                  <th className="px-4 py-2 text-left">Units</th>
                  <th className="px-4 py-2 text-left">Hospital</th>
                  <th className="px-4 py-2 text-left">Reason</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Approved By</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-50 text-gray-800">
                {requests.map((r) =>
                  r.subRequests.map((s) => (
                    <tr key={s._id} className="border-b border-gray-200">
                      <td className="px-4 py-2">{s.patientName}</td>
                      <td className="px-4 py-2">{s.bloodGroup}</td>
                      <td className="px-4 py-2">{s.unitsRequired}</td>
                      <td className="px-4 py-2">{s.hospitalName}</td>
                      <td className="px-4 py-2">{s.reason || "—"}</td>
                      <td className="px-4 py-2">
                        {new Date(s.requestDate).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2">
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
                      </td>
                      <td className="px-4 py-2">
                        {s.approvedBy?.name ||
                          s.approvedBy?.userId?.fullName ||
                          "—"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => {
                            console.log("Parent:", r._id, "Sub:", s._id);
                            handleAction(r._id, s._id, "approve");
                          }}
                          disabled={s.status !== "pending"}
                          className={`px-4 py-1 rounded-md font-semibold ${
                            s.status !== "pending"
                              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700 transition"
                          }`}
                        >
                          {s.status === "approved"
                            ? "Approved"
                            : s.status === "fulfilled"
                            ? "Fulfilled"
                            : "Approve"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
