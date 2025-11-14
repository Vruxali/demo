import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/NGOComponent/Navbar";
import { listCamps, listCampRegistrations } from "../../lib/campApi";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

function NgoReports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [camps, setCamps] = useState([]);
  const [regs, setRegs] = useState([]);

  // Filters
  const [status, setStatus] = useState(""); // upcoming|completed|cancelled|""
  const [city, setCity] = useState("");
  const [campId, setCampId] = useState("");
  const [from, setFrom] = useState(""); // yyyy-mm-dd
  const [to, setTo] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [c, r] = await Promise.all([
          listCamps({}),
          listCampRegistrations({})
        ]);
        if (!mounted) return;
        setCamps(c?.data?.camps || []);
        setRegs(r?.data?.registrations || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load reports");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const filteredCamps = useMemo(() => {
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;
    return (camps || []).filter((c) => {
      if (status && c.status !== status) return false;
      if (city && (c.city || "") !== city) return false;
      const ts = c.startDateTime ? new Date(c.startDateTime).getTime() : null;
      if (fromTs && (!ts || ts < fromTs)) return false;
      if (toTs && (!ts || ts > toTs)) return false;
      if (campId && c._id !== campId) return false;
      return true;
    });
  }, [camps, status, city, from, to, campId]);

  // Map regs to counts by campId
  const countsByCamp = useMemo(() => {
    const map = new Map();
    regs.forEach((r) => {
      const id = r.campId?._id || r.campId?.id;
      if (!id) return;
      const curr = map.get(id) || { donors: 0, volunteers: 0 };
      if (r.type === "donor") curr.donors += 1; else curr.volunteers += 1;
      map.set(id, curr);
    });
    return map;
  }, [regs]);

  const cityOptions = useMemo(() => {
    const set = new Set((camps || []).map(c => c.city).filter(Boolean));
    return Array.from(set).sort();
  }, [camps]);

  // KPIs
  const kpis = useMemo(() => {
    const cs = filteredCamps;
    const totals = cs.reduce((acc, c) => {
      const cnt = countsByCamp.get(c._id) || { donors: 0, volunteers: 0 };
      acc.donors += cnt.donors; acc.volunteers += cnt.volunteers;
      if (c.status === "completed") acc.completed += 1;
      if (c.status === "cancelled") acc.cancelled += 1;
      if (c.status === "upcoming") acc.upcoming += 1;
      return acc;
    }, { donors: 0, volunteers: 0, completed: 0, cancelled: 0, upcoming: 0, events: cs.length });
    return totals;
  }, [filteredCamps, countsByCamp]);

  // Chart data by event
  const chartData = useMemo(() => {
    const arr = filteredCamps.map((c) => {
      const cnt = countsByCamp.get(c._id) || { donors: 0, volunteers: 0 };
      const dt = c.startDateTime ? new Date(c.startDateTime).getTime() : 0;
      return { event: c.title, donors: cnt.donors, volunteers: cnt.volunteers, sortTs: dt };
    });
    arr.sort((a,b) => a.sortTs - b.sortTs);
    return arr;
  }, [filteredCamps, countsByCamp]);

  const exportCsv = () => {
    const header = ["Event","Status","Date","City","Donors","Volunteers"];
    const rows = filteredCamps.map((c) => {
      const cnt = countsByCamp.get(c._id) || { donors: 0, volunteers: 0 };
      const dt = c.startDateTime ? new Date(c.startDateTime) : null;
      const dateStr = dt ? dt.toLocaleString() : "";
      return [
        c.title,
        c.status,
        dateStr,
        c.city || "",
        String(cnt.donors),
        String(cnt.volunteers),
      ];
    });
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ngo-camp-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Reports</h2>
          <p className="text-sm text-gray-500">Analyze your camps by event, city and status</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] text-gray-600 mb-1">Event</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={campId} onChange={(e)=>setCampId(e.target.value)}>
              <option value="">All events</option>
              {camps.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 mb-1">Status</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 mb-1">City</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm" value={city} onChange={(e)=>setCity(e.target.value)}>
              <option value="">All</option>
              {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 mb-1">From</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={from} onChange={(e)=>setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] text-gray-600 mb-1">To</label>
            <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={to} onChange={(e)=>setTo(e.target.value)} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500">Events</div>
            <div className="text-xl font-semibold text-gray-800">{kpis.events}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500">Upcoming</div>
            <div className="text-xl font-semibold text-yellow-600">{kpis.upcoming}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500">Completed</div>
            <div className="text-xl font-semibold text-green-600">{kpis.completed}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500">Cancelled</div>
            <div className="text-xl font-semibold text-red-600">{kpis.cancelled}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500">Donors</div>
            <div className="text-xl font-semibold text-rose-600">{kpis.donors}</div>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <div className="text-xs text-gray-500">Volunteers</div>
            <div className="text-xl font-semibold text-emerald-600">{kpis.volunteers}</div>
          </div>
        </div>

        {/* Chart + Export */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-800">Donors and Volunteers by Event</h3>
              <p className="text-xs text-gray-500">Sorted chronologically</p>
            </div>
            <button onClick={exportCsv} className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm">Export CSV</button>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event" interval={0} angle={-15} textAnchor="end" height={55} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donors" fill="#ef4444" name="Blood Donors" />
                <Bar dataKey="volunteers" fill="#22c55e" name="Volunteers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Event</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Donors</th>
                <th className="px-4 py-3 text-left">Volunteers</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-48"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-44"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"/></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"/></td>
                  </tr>
                ))
              ) : (
                filteredCamps.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={6}>No events match the selected filters.</td>
                  </tr>
                ) : (
                  filteredCamps.map((c) => {
                    const cnt = countsByCamp.get(c._id) || { donors: 0, volunteers: 0 };
                    const d = c.startDateTime ? new Date(c.startDateTime) : null;
                    const dateStr = d ? d.toLocaleString() : "";
                    const badge = c.status === 'completed' ? 'bg-green-100 text-green-700' : c.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
                    return (
                      <tr key={c._id} className="border-t">
                        <td className="px-4 py-3 font-medium text-gray-800">{c.title}</td>
                        <td className="px-4 py-3 text-gray-700">{dateStr}</td>
                        <td className="px-4 py-3">{c.city || '-'}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${badge}`}>{c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span></td>
                        <td className="px-4 py-3">{cnt.donors}</td>
                        <td className="px-4 py-3">{cnt.volunteers}</td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NgoReports
