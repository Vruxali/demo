import React from "react";
import { Bell, User, Droplet } from "lucide-react";
import { NavLink } from "react-router-dom";


const Navbar = ({ user }) => {

  const navLinks = [
    { name: "Dashboard", path: "/patient/dashboard" },
    { name: "Request Blood", path: "/patient/request_blood" },
    { name: "Requested Blood History", path: "/patient/blood_history"},
    { name: "Nearby Donors", path: "/patient/nearby_donors" },
    { name: "Profile", path: "/patient/profile" },
  ];

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Droplet className="text-red-600 w-6 h-6" />
        <h1 className="text-xl font-bold text-red-600">BloodCare</h1>
      </div>

      {/* Nav Links */}
      <ul className="hidden md:flex items-center gap-6 text-gray-600 font-medium">
        {navLinks.map((link, index) => (
          <li key={index}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `cursor-pointer transition-colors ${isActive ? "text-red-600 font-semibold" : "hover:text-red-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4">
        {/* <Bell className="text-gray-600 w-5 h-5" />
        <User className="text-gray-600 w-5 h-5" /> */}
      </div>
    </nav>
  );
};

export default Navbar;
