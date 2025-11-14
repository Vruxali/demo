import React from "react";
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

const CampStatistics = () => {
  const data = [
    { month: "Jan", donors: 120, volunteers: 30 },
    { month: "Feb", donors: 180, volunteers: 45 },
    { month: "Mar", donors: 250, volunteers: 60 },
    { month: "Apr", donors: 200, volunteers: 55 },
    { month: "May", donors: 230, volunteers: 50 },
    { month: "Jun", donors: 260, volunteers: 65 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-800 mb-3">Camp Statistics</h3>
      <p className="text-xs text-gray-500 mb-4">
        Monthly donation trends
      </p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
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
