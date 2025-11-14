import React from "react";
import { Droplet } from "lucide-react";
import { NavLink, Link } from "react-router-dom";



const Topbar = () => {
  const navLinks = [
    { name: "Dashboard", path: "/bloodbank/dashboard" },
    { name: "Manage Inventory", path: "/bloodbank/inventory" },
    { name: "Issued Inventory", path: "/bloodbank/issued" },
    { name: "Hospital Linked", path: "/bloodbank/hospital_linked" },
    { name: "Manage Requests", path: "/bloodbank/requests" },
    { name: "Reports", path: "/bloodbank/reports" },
    { name: "Profile", path: "/bloodbank/profile" },
  ];

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <Droplet className="text-red-600 w-6 h-6" />
        <h1 className="text-xl font-bold text-red-600">BloodCare</h1>
      </Link>

      <ul className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
        {navLinks.map((link, index) => (
          <li key={index}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `cursor-pointer transition-colors ${
                  isActive ? "text-red-600 font-semibold" : "hover:text-red-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4" />
    </nav>
  );
};

export default Topbar;
