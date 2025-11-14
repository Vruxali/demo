import React from "react";
import Navbar from "../../components/NGOComponent/Navbar";
import UpcomingCampCard from "../../components/NGOComponent/UpcomingCampCard";
import ActiveVolunteersCard from "../../components/NGOComponent/ActiveVolunteersCard";
import CampStatistics from "../../components/NGOComponent/CampStatistics";

const NgoDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <UpcomingCampCard />
        <div className="grid md:grid-cols-2 gap-6">
          <ActiveVolunteersCard />
          <CampStatistics />
        </div>
      </main>
    </div>
  );
};

export default NgoDashboard;
