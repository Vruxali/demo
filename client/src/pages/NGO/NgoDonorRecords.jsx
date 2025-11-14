import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/NGOComponent/Navbar";
import { listCampRegistrations } from "../../lib/campApi";

function NgoDonorRecords() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await listCampRegistrations({ type: "donor" });
        if (!mounted) return;
        setRows(data?.registrations || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load donor records");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [])

  const formatted = useMemo(() => (rows || []).map(r => ({
    id: r._id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    city: r.city,
    bloodGroup: r.bloodGroup,
    notes: r.notes,
    campTitle: r.campId?.title,
    when: r.campId?.startDateTime ? new Date(r.campId.startDateTime).toLocaleString() : "",
  })), [rows]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Donor Registrations</h2>
        {error && <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded mb-4">{error}</div>}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Blood Group</th>
                <th className="px-4 py-3">Camp</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-40"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-36"/></td>
                  </tr>
                ))
              ) : (
                formatted.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={6}>No donor registrations yet.</td>
                  </tr>
                ) : (
                  formatted.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-gray-700">{r.email || "-"}{r.email && r.phone ? " • " : ""}{r.phone || "-"}</td>
                      <td className="px-4 py-3">{r.city || "-"}</td>
                      <td className="px-4 py-3">{r.bloodGroup || "-"}</td>
                      <td className="px-4 py-3">{r.campTitle || "-"}</td>
                      <td className="px-4 py-3">{r.when || "-"}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NgoDonorRecords
