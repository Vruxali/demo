import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/NGOComponent/Navbar";
import { createCamp, listCamps, updateCamp, listCampRegistrations } from "../../lib/campApi";
import { Calendar, MapPin, Users, User, FileText, Search, Filter, CheckCircle2, XCircle } from "lucide-react";

const statusOptions = ["upcoming","completed","cancelled"];

function OrganizeCamp() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0,10);
  const [form, setForm] = useState({ title:"", date: today, time:"", location:"", city:"", organizerName:"", expectedDonors:"", notes:"" });
  const [camps, setCamps] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailCamp, setDetailCamp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailStats, setDetailStats] = useState({ donors: 0, volunteers: 0, total: 0, regs: [] });

  const canSubmit = useMemo(()=> form.title && form.date && form.location && form.city, [form]);

  const handleChange = (e)=>{ const {name,value}=e.target; setForm(f=>({...f,[name]:value})); };

  const fetchCamps = async ()=>{
    try {
      const { data } = await listCamps({ q, status: statusFilter });
      setCamps(data.camps||[]);
    } catch(e){ console.error(e); }
  };
  useEffect(()=>{ fetchCamps(); }, [q,statusFilter]);

  const resetForm = () => { setForm({ title:"", date: today, time:"", location:"", city:"", organizerName:"", expectedDonors:"", notes:"" }); setEditingId(null); };

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if(!canSubmit) return;
    setLoading(true);
    try {
      const payload = { ...form, expectedDonors: Number(form.expectedDonors||0) };
      if(editingId) { await updateCamp(editingId, payload); } else { await createCamp(payload); }
      resetForm();
      await fetchCamps();
    } catch(err){ console.error(err); alert(err?.response?.data?.message||"Save failed"); } finally { setLoading(false); }
  };

  const startEdit = (camp)=>{
    setEditingId(camp._id);
    setForm({
      title: camp.title,
      date: camp.startDateTime?.slice(0,10) || today,
      time: camp.startDateTime ? new Date(camp.startDateTime).toISOString().slice(11,16) : "",
      location: camp.location,
      city: camp.city || "",
      organizerName: camp.organizerName || "",
      expectedDonors: camp.expectedDonors?.toString() || "",
      notes: camp.notes || ""
    });
  };

  const updateStatus = async (c, status) => {
    try { await updateCamp(c._id, { status }); await fetchCamps(); } catch(e){ alert("Status update failed"); }
  };

  const openCampDetails = async (camp) => {
    setDetailCamp(camp);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const { data } = await listCampRegistrations({ campId: camp._id });
      const regs = data?.registrations || [];
      const donors = regs.filter(r => r.type === "donor").length;
      const volunteers = regs.filter(r => r.type === "volunteer").length;
      setDetailStats({ donors, volunteers, total: regs.length, regs });
    } catch (e) {
      setDetailStats({ donors: 0, volunteers: 0, total: 0, regs: [] });
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmComplete = async () => {
    if (!detailCamp) return;
    await updateStatus(detailCamp, 'completed');
    setDetailOpen(false);
    setDetailCamp(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-xl font-semibold text-gray-800">Organize Blood Donation Camps</h2>
        <p className="text-sm text-gray-500 mb-6">Schedule new camps and manage existing ones</p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 font-medium text-gray-700">Create New Camp</div>
          <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1"><FileText className="w-3 h-3"/> Camp Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Enter camp title" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1"><Calendar className="w-3 h-3"/> Date & Time</label>
              <div className="mt-1 flex gap-2">
                <input type="date" name="date" value={form.date} onChange={handleChange} className="w-1/2 border rounded-lg px-3 py-2 text-sm" required />
                <input type="time" name="time" value={form.time} onChange={handleChange} className="w-1/2 border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Enter location" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3"/> City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="Enter city" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1"><Users className="w-3 h-3"/> Expected Donors</label>
              <input type="number" min="0" name="expectedDonors" value={form.expectedDonors} onChange={handleChange} placeholder="0" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1"><User className="w-3 h-3"/> Organizer Name</label>
              <input name="organizerName" value={form.organizerName} onChange={handleChange} placeholder="Enter organizer" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1"><FileText className="w-3 h-3"/> Notes / Description</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Add additional information" rows={3} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm">Cancel</button>}
              <button type="submit" disabled={!canSubmit||loading} className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50">
                {loading ? (editingId?"Saving...":"Saving...") : (editingId?"Update":"Save")}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-4 justify-between bg-gray-50">
            <div className="font-medium text-gray-700">Organized Camps</div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none md:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search camps" className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm" />
              </div>
              <div className="relative w-36">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm">
                  <option value="">Status: All</option>
                  {statusOptions.map(s=> <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-red-50 text-gray-700 text-xs">
                <tr>
                  <th className="p-2 text-left">Camp Title</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Location</th>
                  <th className="p-2 text-left">City</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {camps.map(c=> {
                  const d = c.startDateTime ? new Date(c.startDateTime) : null;
                  const dateStr = d ? `${d.toISOString().slice(0,10)}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '—';
                  const statusBadge = c.status === 'completed' ? 'bg-green-100 text-green-700' : c.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';
                  return (
                    <tr key={c._id} className="border-t hover:bg-gray-50">
                      <td className="p-2 font-medium text-gray-800">{c.title}</td>
                      <td className="p-2 text-gray-600">{dateStr}</td>
                      <td className="p-2 text-gray-600">{c.location}</td>
                      <td className="p-2 text-gray-600">{c.city || "—"}</td>
                      <td className="p-2"><span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${statusBadge}`}>{c.status.charAt(0).toUpperCase()+c.status.slice(1)}</span></td>
                      <td className="p-2 flex gap-2">
                        <button onClick={()=>navigate(`/ngo/camps/${c._id}/report`)} className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200" title="Report"><FileText className="w-4 h-4" /></button>
                        {c.status === 'upcoming' && (
                          <button onClick={()=>openCampDetails(c)} className="p-1.5 rounded-md bg-green-100 hover:bg-green-200" title="Complete & Details">
                            <CheckCircle2 className="w-4 h-4 text-green-700" />
                          </button>
                        )}
                        {c.status !== 'cancelled' && <button onClick={()=>updateStatus(c,'cancelled')} className="p-1.5 rounded-md bg-red-100 hover:bg-red-200" title="Cancel"><XCircle className="w-4 h-4 text-red-700" /></button>}
                      </td>
                    </tr>
                  );
                })}
                {camps.length === 0 && (
                  <tr><td className="p-6 text-center text-gray-500" colSpan={5}>No camps found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {detailOpen && detailCamp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
                <p className="text-sm text-gray-500">Review details before marking completed</p>
              </div>
              <button onClick={()=>{ setDetailOpen(false); setDetailCamp(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="text-xs text-gray-500">Title</div>
                <div className="font-medium text-gray-800">{detailCamp.title}</div>
                <div className="text-xs text-gray-500 mt-2">Date & Time</div>
                <div className="text-gray-700">{detailCamp.startDateTime ? new Date(detailCamp.startDateTime).toLocaleString() : '—'}</div>
                <div className="text-xs text-gray-500 mt-2">Location</div>
                <div className="text-gray-700">{detailCamp.location}{detailCamp.city?` • ${detailCamp.city}`:''}</div>
                {detailCamp.organizerName && (
                  <>
                    <div className="text-xs text-gray-500 mt-2">Organizer</div>
                    <div className="text-gray-700">{detailCamp.organizerName}</div>
                  </>
                )}
                {detailCamp.expectedDonors !== undefined && detailCamp.expectedDonors !== null && (
                  <>
                    <div className="text-xs text-gray-500 mt-2">Expected Donors</div>
                    <div className="text-gray-700">{detailCamp.expectedDonors}</div>
                  </>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="text-xs text-gray-500">Summary</div>
                {detailLoading ? (
                  <div className="mt-2 text-gray-500">Loading...</div>
                ) : (
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">Donors</div>
                      <div className="text-xl font-semibold text-red-600">{detailStats.donors}</div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">Volunteers</div>
                      <div className="text-xl font-semibold text-emerald-600">{detailStats.volunteers}</div>
                    </div>
                    <div className="bg-white border rounded-lg p-3 text-center">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-xl font-semibold text-gray-800">{detailStats.total}</div>
                    </div>
                  </div>
                )}
                {detailCamp.notes && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500">Notes</div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">{detailCamp.notes}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={()=>{ setDetailOpen(false); setDetailCamp(null); }} className="px-4 py-2 border rounded">Close</button>
              {detailCamp.status === 'upcoming' && (
                <button onClick={confirmComplete} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Mark as Completed</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizeCamp;
