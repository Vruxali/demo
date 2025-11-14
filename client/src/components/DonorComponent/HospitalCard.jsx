import React from "react";
import { MapPin, Building2 } from "lucide-react";

export default function HospitalCard({ name, distance, address }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 w-full max-w-sm mx-auto cursor-pointer">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-red-100 text-red-600 p-2 rounded-full">
          <Building2 size={20} />
        </div>
        <h3 className="font-semibold text-lg text-gray-800 truncate">
          {name}
        </h3>
      </div>

      {/* Details */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <MapPin size={16} className="mr-2 text-red-500" />
          <span className="truncate">{distance || "Unknown city"}</span>
        </div>
        <p className="text-sm text-gray-500 leading-snug">{address}</p>
      </div>

      {/* New footer badge */}
      <div className="bg-red-50 text-red-600 text-sm font-medium py-2 px-3 rounded-xl text-center">
        Verified Institution
      </div>
    </div>
  );
}
