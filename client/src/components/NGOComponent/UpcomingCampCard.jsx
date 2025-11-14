import React, { useEffect, useState } from "react";
import { CalendarDays, MapPin, Users, Plus, Info, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listCamps } from "../../lib/campApi";

const formatDateTime = (dt) => {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${d.toLocaleDateString()} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const diffDays = (dt) => {
  const now = new Date();
  const target = new Date(dt);
  const ms = target - now;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-white/20 rounded w-1/2" />
    <div className="space-y-2">
      <div className="h-4 bg-white/15 rounded w-2/3" />
      <div className="h-4 bg-white/15 rounded w-1/3" />
      <div className="h-4 bg-white/15 rounded w-1/4" />
    </div>
    <div className="h-10 bg-white/10 rounded" />
  </div>
);

const UpcomingCampCard = () => {
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await listCamps({ status: "upcoming" });
        const upcoming = (data.camps || []).filter(c => c.status === "upcoming");
        if (upcoming.length) {
          const earliest = upcoming.reduce((acc, cur) => new Date(cur.startDateTime) < new Date(acc.startDateTime) ? cur : acc, upcoming[0]);
          setCamp(earliest);
        } else {
          setCamp(null);
        }
      } catch (err) {
        console.error("UpcomingCampCard error", err);
        setError("Failed to load upcoming camp");
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, []);

  const urgencyColor = camp ? (diffDays(camp.startDateTime) <= 3 ? "ring-yellow-300" : "ring-white/30") : "ring-white/20";
  const daysLeft = camp ? diffDays(camp.startDateTime) : null;

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg p-6 text-white ring-1 ${urgencyColor} bg-[radial-gradient(circle_at_20%_20%,#ff6b6b,transparent_60%),linear-gradient(135deg,#b30031,#ff284f)]`}>      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/25 rounded-full blur-2xl" />
      </div>

      <div className="flex items-start justify-between relative z-10">
        <h2 className="text-xl font-semibold tracking-wide flex items-center gap-2">
          <CalendarDays className="w-6 h-6" /> Upcoming Blood Camp
        </h2>
        <button
          onClick={() => navigate('/ngo/organize_camps')}
          className="group flex items-center gap-1 bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors text-xs md:text-sm px-3 py-1.5 rounded-md"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> New
        </button>
      </div>

      <div className="mt-4 relative z-10">
        {loading && <Skeleton />}
        {error && !loading && <p className="text-yellow-200 text-sm flex items-center gap-2"><Info className="w-4 h-4" /> {error}</p>}
        {!loading && !camp && !error && (
          <div className="text-white/85 space-y-2">
            <p className="font-medium text-lg">No upcoming camp scheduled</p>
            <p className="text-sm opacity-80 leading-relaxed">Plan and organize a new camp to boost donor engagement and increase available blood units.</p>
            <button
              onClick={() => navigate('/ngo/organize_camps')}
              className="mt-2 inline-flex items-center gap-2 bg-white text-red-600 font-semibold text-sm px-4 py-2 rounded-md shadow hover:shadow-lg transition"
            >
              <Plus className="w-4 h-4" /> Organize Camp
            </button>
          </div>
        )}
        {camp && (
          <div className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-2xl font-bold leading-tight drop-shadow-sm">{camp.title}</p>
              {daysLeft !== null && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 ${daysLeft <= 3 ? 'bg-yellow-300/20 text-yellow-100' : 'bg-white/10 text-white/80'}`}>                  <Clock className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} day${daysLeft===1?'':'s'} left` : 'Today'}
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col gap-1 bg-white/10 rounded-lg p-3">
                <span className="flex items-center gap-2 font-medium"><CalendarDays className="w-4 h-4" /> Schedule</span>
                <span className="opacity-85 text-xs">{formatDateTime(camp.startDateTime)}</span>
              </div>
              <div className="flex flex-col gap-1 bg-white/10 rounded-lg p-3">
                <span className="flex items-center gap-2 font-medium"><MapPin className="w-4 h-4" /> Location</span>
                <span className="opacity-85 text-xs">{camp.location}{camp.city ? `, ${camp.city}` : ''}</span>
              </div>
              <div className="flex flex-col gap-1 bg-white/10 rounded-lg p-3">
                <span className="flex items-center gap-2 font-medium"><Users className="w-4 h-4" /> Expected Donors</span>
                <span className="opacity-85 text-xs font-semibold">{camp.expectedDonors || 0}</span>
              </div>
            </div>
            {camp.notes && (
              <div className="bg-white/8 rounded-lg border border-white/10 p-3 text-xs leading-relaxed">
                {camp.notes}
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => navigate('/ngo/organize_camps')}
                className="bg-white text-red-600 font-semibold text-sm px-5 py-2 rounded-lg shadow hover:shadow-xl hover:-translate-y-0.5 transition group"
              >
                <span className="group-hover:tracking-wide transition-all">Manage Camps</span>
              </button>
              <button
                onClick={() => navigate('/ngo/reports')}
                className="bg-white/15 hover:bg-white/25 backdrop-blur-sm text-sm px-5 py-2 rounded-lg font-medium border border-white/10 transition"
              >
                View Reports
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingCampCard;
