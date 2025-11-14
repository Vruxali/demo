import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const TrendsChart = ({ data }) => {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Donations vs Usage Trends
        </h3>
        <span className="text-xs text-gray-500">Storage Units</span>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="donations" stroke="#ef4444" />
          <Line type="monotone" dataKey="usage" stroke="#6366f1" />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default TrendsChart;
