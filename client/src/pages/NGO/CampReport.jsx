import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/NGOComponent/Navbar";
import { getCamp, listCampRegistrations } from "../../lib/campApi";

export default function CampReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [regs, setRegs] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [cRes, rRes] = await Promise.all([
          getCamp(id),
          listCampRegistrations({ campId: id })
        ]);
        if (!mounted) return;
        setCamp(cRes?.data?.camp || null);
        setRegs(rRes?.data?.registrations || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load camp report");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [id]);

  const donors = useMemo(() => regs.filter(r => r.type === 'donor'), [regs]);
  const volunteers = useMemo(() => regs.filter(r => r.type === 'volunteer'), [regs]);

  const dt = camp?.startDateTime ? new Date(camp.startDateTime) : null;
  const dateStr = dt ? dt.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' }) : "";
  const timeStr = dt ? dt.toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' }) : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-800 mb-4">← Back</button>
        {error && <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded mb-4">{error}</div>}
        {loading ? (
          <div className="bg-white rounded-xl border p-6 animate-pulse h-64" />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{camp?.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{dateStr}{timeStr?` • ${timeStr}`:''} • {camp?.location}{camp?.city?` • ${camp.city}`:''}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${camp?.status === 'completed' ? 'bg-green-100 text-green-700' : camp?.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {camp?.status?.charAt(0).toUpperCase()+camp?.status?.slice(1)}
                </span>
              </div>
              {camp?.notes && (
                <div className="mt-3 text-sm text-gray-700">{camp.notes}</div>
              )}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white border rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Expected Donors</div>
                  <div className="text-lg font-semibold text-gray-800">{camp?.expectedDonors ?? 0}</div>
                </div>
                <div className="bg-white border rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Registered Donors</div>
                  <div className="text-lg font-semibold text-red-600">{donors.length}</div>
                </div>
                <div className="bg-white border rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Volunteers</div>
                  <div className="text-lg font-semibold text-emerald-600">{volunteers.length}</div>
                </div>
                <div className="bg-white border rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Organizer</div>
                  <div className="text-lg font-semibold text-gray-800">{camp?.organizerName || '-'}</div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Donor Registrations</h3>
                <div className="bg-gray-50 border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Contact</th>
                        <th className="px-3 py-2 text-left">Blood Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donors.length === 0 ? (
                        <tr><td className="px-3 py-4 text-gray-500" colSpan={3}>No donors</td></tr>
                      ) : donors.map(d => (
                        <tr key={d._id} className="border-t">
                          <td className="px-3 py-2 font-medium">{d.name}</td>
                          <td className="px-3 py-2 text-gray-700">{d.email || '-' }{d.email && d.phone ? ' • ' : ''}{d.phone || '-'}</td>
                          <td className="px-3 py-2">{d.bloodGroup || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Volunteer Registrations</h3>
                <div className="bg-gray-50 border rounded-lg overflow-hidden">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left">Name</th>
                        <th className="px-3 py-2 text-left">Contact</th>
                        <th className="px-3 py-2 text-left">Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.length === 0 ? (
                        <tr><td className="px-3 py-4 text-gray-500" colSpan={3}>No volunteers</td></tr>
                      ) : volunteers.map(v => (
                        <tr key={v._id} className="border-t">
                          <td className="px-3 py-2 font-medium">{v.name}</td>
                          <td className="px-3 py-2 text-gray-700">{v.email || '-' }{v.email && v.phone ? ' • ' : ''}{v.phone || '-'}</td>
                          <td className="px-3 py-2">{v.availability || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
