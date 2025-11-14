import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Header () {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();


  const handleJoinDonor = () => {
    navigate("/register/donor");
  };


  const handleRequestBlood = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Verify login and get role from backend
      const res = await axios.get("http://localhost:8080/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data.user;

      if (user.role === "patient") {
        navigate("/dashboard/patient");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      navigate("/login");
    }
  };



    return (


      <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white sticky top-0 z-50">
        {/* Left: Logo */}
        <h1 className="text-2xl font-bold text-red-600">BloodCare</h1>

        {/* Center: Navigation */}
        <nav className="flex-1 flex justify-center">
          <div className="hidden md:flex gap-8 text-gray-700 font-medium [&>a:hover]:text-red-600">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</Link>
            <Link to="#">About</Link>
            <Link to="#">How It Works</Link>
            <Link to="/login">Login</Link>
          </div>
        </nav>

        <div className="hidden md:flex gap-3">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={handleJoinDonor}
          >
            Register as Donor
          </button>
          <button
            className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50"
            onClick={handleRequestBlood}
          >
            Request Blood
          </button>
        </div>

        {/* Mobile hamburger menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="text-2xl"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu: show when menuOpen is true */}
        {menuOpen && (
          <nav className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col gap-4 p-4 md:hidden z-40">
            <Link to="/" className="text-gray-600 font-medium">
              Home
            </Link>
            <Link to="#" className="text-gray-600 font-medium">
              About
            </Link>
            <Link to="#" className="text-gray-600 font-medium">
              How It Works
            </Link>
            <Link to="/login" className="text-gray-600 font-medium">
              Login
            </Link>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={handleJoinDonor}>
              Register as Donor
            </button>
            <button className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50" onClick={handleRequestBlood}>
              Request Blood
            </button>
          </nav>
        )}
      </header>
    );
  }

  export default Header;
