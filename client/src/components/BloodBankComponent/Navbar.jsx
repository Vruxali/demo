import React from "react";
import { Bell , Droplet , User } from "lucide-react";



const Topbar = () => {
  const navLinks = [
    { name: "Dashboard", path: "/bloodbank/dashboard" },
    { name: "Manage Inventory", path: "/bloodbank/inventory" },
    { name: "Hospital Linked", path: "/bloodbank/hospital_linked" },
    { name: "Manage Requests", path: "/bloodbank/requests" },
    { name: "Reports", path: "/bloodbank/reports" },
  ];

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Droplet className="text-red-600 w-6 h-6" />
        <h1 className="text-xl font-bold text-red-600">BloodCare</h1>
      </div>

      <ul className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
        <li className="cursor-pointer hover:text-red-600">Dashboard</li>
        <li className="cursor-pointer hover:text-red-600">Manage Inventory</li>
        <li className="cursor-pointer hover:text-red-600">Hospital Linked</li>
        <li className="cursor-pointer hover:text-red-600">Requests</li>
        <li className="cursor-pointer hover:text-red-600">Reports</li>
      </ul>

      <div className="flex items-center gap-4">
        {/* <Bell className="text-gray-600 w-5 h-5" />
        <User className="text-gray-600 w-5 h-5" /> */}
      </div>
    </nav>
  );
};

export default Topbar;
