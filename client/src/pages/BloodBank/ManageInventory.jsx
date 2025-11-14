import React, { useEffect, useMemo, useState } from "react";
import { createInventoryEntry, listInventoryEntries, getInventorySummary, getExpirySummary } from "../../lib/inventoryApi";
import { useAuth } from "../../context/AuthContext";
import Topbar from "../../components/BloodBankComponent/Navbar";
import { Droplet, CalendarDays, Boxes, AlertCircle } from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const components = ["Whole Blood", "RBC", "Plasma", "Platelets"];
const sources = ["Donation", "Purchase", "Transfer", "Camp"];

function ManageInventory() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    bloodGroup: "",
    componentType: "",
    units: "",
    sourceType: "",
    sourceName: "",
    collectionDate: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    expiryDate: "",
    storageLocation: "",
    notes: "",
  });
  const [entries, setEntries] = useState([]);
  const [filters, setFilters] = useState({ bloodGroup: "", componentType: "", sourceType: "" });
  const [summary, setSummary] = useState([]);
  const [expiry, setExpiry] = useState({ expired: [], expiringSoon: [] });
  const [loading, setLoading] = useState(false);

  const computeExpiry = (componentType, baseDateStr) => {
    if (!componentType || !baseDateStr) return "";
    const base = new Date(baseDateStr);
    const addDays = (d) => {
      const dt = new Date(base);
      dt.setDate(dt.getDate() + d);
      return dt.toISOString().slice(0, 10);
    };
    switch (componentType) {
      case "Whole Blood":
        return addDays(35); // CPDA-1 ~35 days
      case "RBC":
        return addDays(42); // SAGM packed cells ~42 days
      case "Platelets":
        return addDays(5); // room temp storage ~5 days
      case "Plasma":
        return addDays(365); // frozen plasma up to 1 year
      default:
        return "";
    }
  };

  const canSubmit = useMemo(() => {
    return (
      form.bloodGroup && form.componentType && form.sourceType && Number(form.units) > 0 && form.receivedDate
    );
  }, [form]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const { data } = await listInventoryEntries(filters);
      setEntries(data.entries || []);
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
  const loadExpiry = async () => {
    try {
      const { data } = await getExpirySummary();
      setExpiry({ expired: data.expired || [], expiringSoon: data.expiringSoon || [] });
    } catch {}
  };

  useEffect(() => {
    loadEntries();
    loadSummary();
    loadExpiry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Auto-calculate expiry when component or dates change
  useEffect(() => {
    const base = form.collectionDate || form.receivedDate;
    const auto = computeExpiry(form.componentType, base);
    if (auto) setForm((f) => ({ ...f, expiryDate: auto }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.componentType, form.collectionDate, form.receivedDate]);

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
      await createInventoryEntry(payload);
      setForm((f) => ({
        ...f,
        sourceName: "",
        units: "",
        storageLocation: "",
        notes: "",
      }));
      await Promise.all([loadEntries(), loadSummary(), loadExpiry()]);
    } catch (err) {
      console.error(err);
      alert("Failed to save inventory entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <Topbar />
      <div className="px-5 py-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
            <Droplet className="text-red-600" /> Manage Inventory
          </h2>
          <p className="text-sm text-gray-500 mt-1">Record and monitor incoming blood components. Role: <span className="font-medium text-gray-700">{user?.role || "—"}</span></p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="px-3 py-1 rounded-full bg-green-100 text-green-700">WB 35d</div>
          <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">RBC 42d</div>
          <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Platelets 5d</div>
          <div className="px-3 py-1 rounded-full bg-violet-100 text-violet-700">Plasma 365d</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 bg-white/90 backdrop-blur rounded-2xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Source Type</label>
          <select name="sourceType" value={form.sourceType} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" required>
            <option value="" disabled>Choose source...</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Source Name</label>
          <input name="sourceName" value={form.sourceName} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" placeholder="Donor / Vendor / Hospital" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Blood Group</label>
          <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" required>
            <option value="" disabled>Select blood group...</option>
            {bloodGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Component</label>
          <select name="componentType" value={form.componentType} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" required>
            <option value="" disabled>Select component...</option>
            {components.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Units</label>
          <input name="units" type="number" min="1" value={form.units} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" placeholder="e.g., 2" required />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Collection Date</label>
          <input name="collectionDate" type="date" value={form.collectionDate} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Received Date</label>
          <input name="receivedDate" type="date" value={form.receivedDate} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Expiry Date</label>
          <input name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1 flex items-center gap-1"><Boxes className="w-3 h-3" /> Storage Location</label>
          <input name="storageLocation" value={form.storageLocation} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" placeholder="Fridge-2 / Shelf-A" />
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-semibold tracking-wide text-gray-600 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border border-gray-300 focus:ring-red-500 focus:border-red-500 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Important remarks, conditions, etc." />
        </div>
        <div className="md:col-span-3 flex justify-end gap-2">
          <button type="submit" disabled={!canSubmit || loading} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400 transition-all text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Saving..." : "Add Inventory"}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Inventory Entries</h3>
          <div className="text-xs text-gray-500">Total: {entries.length}</div>
        </div>
        <div className="flex flex-wrap gap-3 my-4">
          <select value={filters.sourceType} onChange={(e)=>setFilters(f=>({...f, sourceType: e.target.value}))} className="border rounded-md p-2">
            <option value="">Filter source...</option>
            {sources.map(s=> <option key={s} value={s}>{s}</option>)}
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
                <th className="p-2 text-left">Source</th>
                <th className="p-2 text-left">Blood</th>
                <th className="p-2 text-left">Component</th>
                <th className="p-2 text-left">Units</th>
                <th className="p-2 text-left">Received</th>
                <th className="p-2 text-left">Expiry</th>
                <th className="p-2 text-left">Storage</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id} className="border-t hover:bg-red-50/40 transition-colors">
                  <td className="p-2 font-medium text-gray-700">{e.sourceType}{e.sourceName ? ` • ${e.sourceName}` : ""}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">{e.bloodGroup}</span>
                  </td>
                  <td className="p-2">{e.componentType}</td>
                  <td className="p-2 font-semibold text-gray-800">{e.units}</td>
                  <td className="p-2 text-gray-600">{new Date(e.receivedDate).toLocaleDateString("en-IN")}</td>
                  <td className="p-2">{e.expiryDate ? <span className="text-gray-700">{new Date(e.expiryDate).toLocaleDateString("en-IN")}</span> : <span className="text-gray-400">—</span>}</td>
                  <td className="p-2 text-gray-600">{e.storageLocation || <span className="text-gray-400">—</span>}</td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={7}>No entries yet</td>
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
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-700 flex items-center gap-1"><Droplet className="w-4 h-4 text-red-500" /> {s.type}</span>
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
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-600" /> Expiry Alerts</h3>
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-red-700">Expired Units</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
            {expiry.expired.map((s) => (
              <div key={`ex-${s.bloodGroup}-${s.componentType}`} className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-red-700">{s.type}</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">Expired</span>
                </div>
                <div className="text-lg font-bold mt-2 text-red-800">{s.units} Units</div>
                <div className="text-[11px] text-red-600">As of {s.updated}</div>
              </div>
            ))}
            {expiry.expired.length === 0 && (
              <div className="text-gray-500 text-sm">No expired units</div>
            )}
          </div>
        </div>
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-yellow-700">Expiring in 7 Days</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
            {expiry.expiringSoon.map((s) => (
              <div key={`soon-${s.bloodGroup}-${s.componentType}`} className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-yellow-800">{s.type}</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">Expiring Soon</span>
                </div>
                <div className="text-lg font-bold mt-2 text-yellow-800">{s.units} Units</div>
                <div className="text-[11px] text-yellow-700">As of {s.updated}</div>
              </div>
            ))}
            {expiry.expiringSoon.length === 0 && (
              <div className="text-gray-500 text-sm">No upcoming expiries</div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ManageInventory;
