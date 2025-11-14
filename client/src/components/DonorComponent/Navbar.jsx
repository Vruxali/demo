import React from "react";
import { NavLink } from "react-router-dom";
import { Bell, User, Droplet } from "lucide-react";

function Navbar() {
  const navLinks = [
    // { name: "Home", path: "/" },
    { name: "Dashboard", path: "/donor/dashboard" },
    { name: "Donate History", path: "/donor/history" },
    { name: "Available Camps", path: "/donor/camps" },
    // { name: "Request Blood", path: "/donor/request_blood" },
    { name: "Manage Requests" , path: "/donor/requests"},
    { name: "Profile", path: "/donor/profile" },
  ];

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      {/* Logo */}
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

      {/* Icons */}
      <div className="flex items-center gap-4">
        {/* <Bell className="text-gray-600 w-5 h-5 cursor-pointer hover:text-red-600" />
        <User className="text-gray-600 w-5 h-5 cursor-pointer hover:text-red-600" /> */}
      </div>
    </nav>
  );
}

export default Navbar;
