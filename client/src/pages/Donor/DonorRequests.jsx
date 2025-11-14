import React from "react";
import Navbar from "../../components/DonorComponent/Navbar";
import ManageRequests from "../../components/Shared/ManageRequests";

export default function DonorRequests() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ManageRequests />
    </div>
  );
}
