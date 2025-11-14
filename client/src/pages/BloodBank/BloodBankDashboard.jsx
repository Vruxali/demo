import React, { useEffect, useState } from "react";
import Navbar from "../../components/BloodBankComponent/Navbar";
import InventorySummary from "../../components/BloodBankComponent/InventorySummary";
import TrendsChart from "../../components/BloodBankComponent/TrendsChart";
import HospitalList from "../../components/BloodBankComponent/HospitalList";

const BloodBankDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    // Simulate API callss
    setInventory([
      { type: "A+", units: 245, status: "Good Stock", updated: "2 hours ago" },
      { type: "A-", units: 89, status: "Low Stock", updated: "1 hour ago" },
      { type: "B+", units: 178, status: "Good Stock", updated: "30 mins ago" },
      { type: "B-", units: 23, status: "Critical", updated: "15 mins ago" },
      { type: "O+", units: 312, status: "Good Stock", updated: "45 mins ago" },
      { type: "O-", units: 67, status: "Low Stock", updated: "20 mins ago" },
      { type: "AB+", units: 134, status: "Good Stock", updated: "1 hour ago" },
      { type: "AB-", units: 18, status: "Critical", updated: "10 mins ago" },
    ]);

    setChartData([
      { month: "Jan", donations: 120, usage: 95 },
      { month: "Feb", donations: 130, usage: 105 },
      { month: "Mar", donations: 140, usage: 115 },
      { month: "Apr", donations: 160, usage: 130 },
      { month: "May", donations: 155, usage: 120 },
      { month: "Jun", donations: 175, usage: 140 },
      { month: "Jul", donations: 180, usage: 155 },
      { month: "Aug", donations: 190, usage: 165 },
      { month: "Sep", donations: 200, usage: 175 },
      { month: "Oct", donations: 195, usage: 160 },
      { month: "Nov", donations: 185, usage: 155 },
      { month: "Dec", donations: 170, usage: 145 },
    ]);

    setHospitals([
      { name: "City General Hospital", lastRequest: "2 hours ago" },
      { name: "St. Mary Medical Center", lastRequest: "5 hours ago" },
      { name: "Regional Emergency Center", lastRequest: "1 day ago" },
      { name: "Metro Health Institute", lastRequest: "3 hours ago" },
      { name: "University Medical Center", lastRequest: "1 hour ago" },
    ]);
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
