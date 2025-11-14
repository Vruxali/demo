import React, { useEffect, useMemo, useState } from "react";
import { issueInventory, listIssuedInventory, getInventorySummary, getExpirySummary } from "../../lib/inventoryApi";
import { useAuth } from "../../context/AuthContext";
import Topbar from "../../components/BloodBankComponent/Navbar";
import { ArrowRightCircle, UserPlus, Droplet, CalendarDays, Hash } from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const components = ["Whole Blood", "RBC", "Plasma", "Platelets"];
const recipients = ["Patient", "Hospital", "NGO", "Donor"];

function IssuedInventory() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup: "",
    componentType: "",
    units: "",
    issuedToType: "",
    issuedToName: "",
    requestRefId: "",
    issuedDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [issues, setIssues] = useState([]);
  const [filters, setFilters] = useState({ bloodGroup: "", componentType: "", issuedToType: "" });
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState([]);

  const canSubmit = useMemo(() => {
    return (
      form.bloodGroup && form.componentType && form.issuedToType && Number(form.units) > 0 && form.issuedDate
    );
  }, [form]);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const { data } = await listIssuedInventory(filters);
      setIssues(data.issues || []);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const { data } = await getInventorySummary();
      setSummary(data.summary || []);
    } catch {}
  };

  const loadExpired = async () => {
    try {
      const { data } = await getExpirySummary();
      setExpired(data.expired || []);
    } catch {}
  };

  useEffect(() => {
    loadIssues();
    loadSummary();
    loadExpired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        units: Number(form.units),
      };
      await issueInventory(payload);
      setForm((f) => ({
        ...f,
        issuedToName: "",
        units: "",
        notes: "",
      }));
      await Promise.all([loadIssues(), loadSummary(), loadExpired()]);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to issue units";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-violet-50">
      <Topbar />
      <div className="px-5 py-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-2"><ArrowRightCircle className="text-violet-600" /> Issue Inventory</h2>
          <p className="text-sm text-gray-500 mt-1">Dispatch units to recipients & maintain balance. Role: <span className="font-medium text-gray-700">{user?.role || "—"}</span></p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="px-3 py-1 rounded-full bg-violet-100 text-violet-700">Track Issuance</div>
          <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">Real-time Balance</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-violet-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><UserPlus className="w-3 h-3" /> Recipient Type</label>
          <select name="issuedToType" value={form.issuedToType} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" required>
            <option value="" disabled>Select recipient...</option>
            {recipients.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Recipient Name</label>
          <input name="issuedToName" value={form.issuedToName} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" placeholder="Patient / Hospital" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><Droplet className="w-3 h-3" /> Blood Group</label>
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" required>
            <option value="" disabled>Select blood group...</option>
            {bloodGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Component</label>
          <select name="componentType" value={form.componentType} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" required>
            <option value="" disabled>Select component...</option>
            {components.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><Hash className="w-3 h-3" /> Units</label>
          <input name="units" type="number" min="1" value={form.units} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" placeholder="e.g., 1" required />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Issued Date</label>
          <input name="issuedDate" type="date" value={form.issuedDate} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Request Reference (optional)</label>
          <input name="requestRefId" value={form.requestRefId} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" placeholder="Blood Request ID" />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border border-gray-300 focus:ring-violet-500 focus:border-violet-500 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Clinical context / transfusion reason" />
        </div>
        <div className="md:col-span-3 flex justify-end gap-2">
          <button type="submit" disabled={!canSubmit || loading} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 focus:ring-2 focus:ring-violet-400 transition-all text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Issuing..." : "Issue Units"}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Issued Records</h3>
          <div className="text-xs text-gray-500">Total: {issues.length}</div>
        </div>
        <div className="flex flex-wrap gap-3 my-4">
          <select value={filters.issuedToType} onChange={(e)=>setFilters(f=>({...f, issuedToType: e.target.value}))} className="border rounded-md p-2">
            <option value="">Filter recipient...</option>
            {recipients.map(r=> <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={filters.bloodGroup} onChange={(e)=>setFilters(f=>({...f, bloodGroup: e.target.value}))} className="border rounded-md p-2">
            <option value="">Filter blood group...</option>
            {bloodGroups.map(g=> <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filters.componentType} onChange={(e)=>setFilters(f=>({...f, componentType: e.target.value}))} className="border rounded-md p-2">
            <option value="">Filter component...</option>
            {components.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wide">
              <tr>
                <th className="p-2 text-left">Recipient</th>
                <th className="p-2 text-left">Blood</th>
                <th className="p-2 text-left">Component</th>
                <th className="p-2 text-left">Units</th>
                <th className="p-2 text-left">Issued</th>
                <th className="p-2 text-left">Request Ref</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((e) => (
                <tr key={e._id} className="border-t hover:bg-violet-50/40 transition-colors">
                  <td className="p-2 font-medium text-gray-700">{e.issuedToType}{e.issuedToName ? ` • ${e.issuedToName}` : ""}</td>
                  <td className="p-2"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">{e.bloodGroup}</span></td>
                  <td className="p-2">{e.componentType}</td>
                  <td className="p-2 font-semibold text-gray-800">{e.units}</td>
                  <td className="p-2 text-gray-600">{new Date(e.issuedDate).toLocaleDateString("en-IN")}</td>
                  <td className="p-2 text-gray-600">{e.requestRefId || <span className="text-gray-400">—</span>}</td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>No issued records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Stock Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((s) => (
            <div key={`${s.bloodGroup}-${s.componentType}`} className="relative overflow-hidden group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-700 flex items-center gap-1"><Droplet className="w-4 h-4 text-violet-500" /> {s.type}</span>
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${s.status === "Good Stock" ? "bg-green-100 text-green-700" : s.status === "Low Stock" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{s.status}</span>
              </div>
              <div className="text-2xl font-bold mt-2 tracking-tight text-gray-800">{s.units}<span className="text-sm font-medium text-gray-500 ml-1">Units</span></div>
              <div className="text-[11px] text-gray-500 mt-1">Updated {s.updated}</div>
            </div>
          ))}
          {summary.length === 0 && (
            <div className="text-gray-500 text-sm">No summary available</div>
          )}
        </div>
      </div>
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Expired Units</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {expired.map((s) => (
            <div key={`exp-${s.bloodGroup}-${s.componentType}`} className="relative overflow-hidden group rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <span className="font-medium text-red-700 flex items-center gap-1"><Droplet className="w-4 h-4 text-red-500" /> {s.type}</span>
                <span className="text-[10px] px-2 py-1 rounded-full font-semibold bg-red-100 text-red-700">Expired</span>
              </div>
              <div className="text-2xl font-bold mt-2 tracking-tight text-red-800">{s.units}<span className="text-sm font-medium text-red-700 ml-1">Units</span></div>
              <div className="text-[11px] text-red-600 mt-1">Updated {s.updated}</div>
            </div>
          ))}
          {expired.length === 0 && (
            <div className="text-gray-500 text-sm">No expired units</div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default IssuedInventory;
