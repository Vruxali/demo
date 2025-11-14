import React from "react";
import { Building2 } from "lucide-react";

const HospitalList = ({ hospitals }) => {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 mt-8 lg:mt-0">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Connected Hospitals
      </h3>
      <div className="space-y-3">
        {hospitals.map((h) => (
          <div
            key={h.name}
            className="flex justify-between items-center border rounded-lg p-3 hover:shadow transition"
          >
            <div className="flex items-center gap-3">
              <Building2 className="text-blue-500 w-5 h-5" />
              <div>
                <p className="font-medium text-gray-700">{h.name}</p>
                <p className="text-xs text-gray-500">
                  Last request: {h.lastRequest}
                </p>
              </div>
            </div>
            {/* Action removed per request: no view link on dashboard */}
          </div>
        ))}
      </div>
    </section>
  );
};

export default HospitalList;
