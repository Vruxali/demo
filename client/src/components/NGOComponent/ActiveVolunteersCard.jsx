import { useEffect, useMemo, useState } from "react";
import { listCampRegistrations } from "../../lib/campApi";

const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = ["bg-rose-500","bg-indigo-500","bg-emerald-500","bg-amber-500","bg-sky-500"]; 
  const color = colors[(name || "").length % colors.length];
  return (
    <div className={`h-10 w-10 ${color} text-white rounded-full flex items-center justify-center text-sm font-semibold`}>{initials}</div>
  );
};

const IconButton = ({ title, colorClass, children }) => (
  <button title={title} className={`h-9 w-9 rounded-lg flex items-center justify-center ${colorClass}`}>
    {children}
  </button>
);

export default function ActiveVolunteersCard() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await listCampRegistrations({ type: "volunteer" });
        if (!mounted) return;
        setRows(data?.registrations || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load volunteers");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const total = rows.length;
  const top = useMemo(() => rows.slice(0, 3), [rows]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Active Volunteers</h3>
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-1">{total} Active</span>
      </div>
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-gray-200 rounded" />
                <div className="h-9 w-9 bg-gray-200 rounded" />
                <div className="h-9 w-9 bg-gray-200 rounded" />
              </div>
            </div>
          ))
        ) : (
          top.length === 0 ? (
            <div className="text-sm text-gray-500">No volunteers yet.</div>
          ) : (
            top.map((v) => (
              <div key={v._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Avatar name={v.name} />
                  <div>
                    <div className="font-medium text-gray-800">{v.name}</div>
                    <div className="text-xs text-gray-500">{v.notes || "Volunteer"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton title="Call" colorClass="bg-blue-50 text-blue-600 border border-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M2 3a1 1 0 011-1h3a1 1 0 011 .78l1 4a1 1 0 01-.27.95l-1.7 1.7a16 16 0 007.07 7.07l1.7-1.7a1 1 0 01.95-.27l4 1a1 1 0 01.78 1V21a1 1 0 01-1 1h-3C8.82 22 2 15.18 2 6V3z"/></svg>
                  </IconButton>
                  <IconButton title="Message" colorClass="bg-sky-50 text-sky-600 border border-sky-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M2 5a3 3 0 013-3h14a3 3 0 013 3v9a3 3 0 01-3 3H8l-4 4v-4H5a3 3 0 01-3-3V5z"/></svg>
                  </IconButton>
                  <IconButton title="Mark" colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  </IconButton>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
