import React from "react";
import Navbar from "../../components/NGOComponent/Navbar";
import OrganizeCamp from "../../pages/NGO/OrganizeCamp";
import VolunteerList from "../../pages/NGO/VolunteerList";
import CampStatistics from "../../components/NGOComponent/CampStatistics";

const NgoDashboard = () => {
  return (
      <div className="min-h-screen bg-gray-50">
      <Navbar />
        <main className="flex-1 p-6 space-y-6">
          <OrganizeCamp />
          <div className="grid md:grid-cols-2 gap-6">
            <VolunteerList />
            <CampStatistics />
          </div>
        </main>
      </div>

  );
};

export default NgoDashboard;
