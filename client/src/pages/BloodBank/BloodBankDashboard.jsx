import React, { useEffect, useState } from "react";
import Navbar from "../../components/BloodBankComponent/Navbar";
import InventorySummary from "../../components/BloodBankComponent/InventorySummary";
import TrendsChart from "../../components/BloodBankComponent/TrendsChart";
import HospitalList from "../../components/BloodBankComponent/HospitalList";
import { getBloodBankDashboard } from "../../lib/bloodBankApi";

const BloodBankDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getBloodBankDashboard();
        if (!active) return;
        setInventory(data.inventory || []);
        setChartData(data.chartData || []);
        setHospitals(data.hospitals || []);
      } catch (e) {
        console.error("Dashboard load error", e);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
        <main className="max-w-7xl mx-auto p-6">
          <InventorySummary inventory={inventory} />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendsChart data={chartData} />
            </div>
            <HospitalList hospitals={hospitals} />
          </div>
        </main>
      
    </div>
  );
};

export default BloodBankDashboard;
