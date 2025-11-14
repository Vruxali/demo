import React, { useEffect, useMemo, useState } from "react";
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
import { listCampRegistrations } from "../../lib/campApi";

const CampStatistics = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await listCampRegistrations({});
        if (!mounted) return;
        setRows(data?.registrations || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || "Failed to load statistics");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const data = useMemo(() => {
    // Group by event (camp) title instead of by month
    const map = new Map(); // key: campId
    rows.forEach((r) => {
      const id = r.campId?._id || r.campId?.id;
      if (!id) return;
      const title = r.campId?.title || "Untitled";
      const dt = r.campId?.startDateTime ? new Date(r.campId.startDateTime) : null;
      const key = String(id);
      const curr = map.get(key) || { event: title, donors: 0, volunteers: 0, sortTs: dt ? dt.getTime() : 0 };
      if (r.type === "donor") curr.donors += 1; else curr.volunteers += 1;
      curr.event = title; // keep latest title
      if (!curr.sortTs && dt) curr.sortTs = dt.getTime();
      map.set(key, curr);
    });
    const arr = Array.from(map.values());
    arr.sort((a, b) => a.sortTs - b.sortTs);
    return arr;
  }, [rows]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Camp Statistics</h3>
      <p className="text-xs text-gray-500 mb-4">Donors and volunteers by event</p>
      {error && <div className="text-xs text-red-600 mb-2">{error}</div>}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
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
  );
};

export default CampStatistics;
