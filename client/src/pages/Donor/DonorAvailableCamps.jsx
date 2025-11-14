import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/DonorComponent/Navbar";
import { listAvailableCamps, createCampRegistration } from "../../lib/campApi";

function DonorAvailableCamps() {
  const [loading, setLoading] = useState(true);
  const [camps, setCamps] = useState([]);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [regType, setRegType] = useState("donor");
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", bloodGroup: "", availability: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await listAvailableCamps();
        if (!mounted) return;
        setCamps(data?.camps || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load camps");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const openRegister = (camp) => {
    if (camp?.status === "cancelled") return; // prevent opening modal for cancelled camps
    setSelectedCamp(camp);
    setRegType("donor");
    setForm({ name: "", email: "", phone: "", city: camp?.city || "", bloodGroup: "", availability: "", notes: "" });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setSelectedCamp(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCamp) return;
    if (!form.name?.trim()) {
      window.alert("Please enter your name.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        campId: selectedCamp._id,
        type: regType,
        name: form.name.trim(),
        email: form.email?.trim() || "",
        phone: form.phone?.trim() || "",
        city: form.city?.trim() || "",
        bloodGroup: regType === "donor" ? (form.bloodGroup || "") : "",
        availability: regType === "volunteer" ? (form.availability || "") : "",
        notes: form.notes?.trim() || "",
      };
      await createCampRegistration(payload);
      window.alert("Registration submitted successfully.");
      setModalOpen(false);
      setSelectedCamp(null);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit registration.";
      window.alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formattedCamps = useMemo(() => {
    return (camps || []).map((c) => {
      const dt = c.startDateTime ? new Date(c.startDateTime) : null;
      return {
        ...c,
        _id: c._id || c.id,
        dateStr: dt ? dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "",
        timeStr: dt ? dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "",
      };
    });
  }, [camps]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Available Camps</h2>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded mb-4">{error}</div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow animate-pulse h-28" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {formattedCamps.length === 0 && (
              <div className="text-gray-500">No upcoming camps available.</div>
            )}
            {formattedCamps.map((camp) => (
              <div key={camp._id} className="bg-white p-5 rounded-xl shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{camp.title}</h3>
                    {camp.status === "cancelled" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 border border-gray-300">Cancelled</span>
                    )}
                  </div>
                  <p className="text-gray-500">{camp.dateStr} {camp.timeStr ? `• ${camp.timeStr}` : ""} | {camp.location} {camp.city ? `• ${camp.city}` : ""}</p>
                </div>
                <button
                  onClick={() => openRegister(camp)}
                  disabled={camp.status === "cancelled"}
                  className={`px-4 py-2 mt-3 sm:mt-0 rounded-lg ${camp.status === "cancelled" ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && selectedCamp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">Register for {selectedCamp.title}</h3>
                <p className="text-sm text-gray-500">{selectedCamp.location}{selectedCamp.city ? ` • ${selectedCamp.city}` : ""}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="flex gap-3 mb-4">
              <button onClick={() => setRegType("donor")} className={`px-3 py-1 rounded border ${regType === "donor" ? "bg-red-600 text-white border-red-600" : "border-gray-300"}`}>Donor</button>
              <button onClick={() => setRegType("volunteer")} className={`px-3 py-1 rounded border ${regType === "volunteer" ? "bg-red-600 text-white border-red-600" : "border-gray-300"}`}>Volunteer</button>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="City" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Phone" />
                </div>
              </div>

              {regType === "donor" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Blood Group</label>
                  <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="w-full border rounded px-3 py-2">
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              )}

              {regType === "volunteer" && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Availability / Time Slot</label>
                  <input name="availability" value={form.availability} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="e.g., 10am-1pm" />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-600 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} placeholder="Anything we should know?" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded">Cancel</button>
                <button disabled={submitting} type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-70">
                  {submitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorAvailableCamps;