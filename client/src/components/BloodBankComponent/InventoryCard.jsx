import React from "react";
import { Droplet } from "lucide-react";

const InventoryCard = ({ type, units, status, updated }) => {
  const badgeColor =
    status === "Good Stock"
      ? "bg-green-100 text-green-700"
      : status === "Low Stock"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Droplet className="text-red-500 w-5 h-5" />
          <h4 className="font-semibold text-gray-700">{type}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${badgeColor}`}>
          {status}
        </span>
      </div>
      <p className="text-xl font-bold text-gray-800">{units} Units</p>
      <p className="text-xs text-gray-500 mt-1">Last updated: {updated}</p>
    </div>
  );
};

export default InventoryCard;
