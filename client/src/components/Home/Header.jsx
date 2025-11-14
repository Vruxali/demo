import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Header () {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardPath, setDashboardPath] = useState("/login");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setIsLoggedIn(false);
        const res = await axios.get('http://localhost:8080/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data.user;
        if (user && user.role) {
          setIsLoggedIn(true);
          switch (user.role) {
            case 'donor':
              setDashboardPath('/donor/dashboard');
              break;
            case 'patient':
              setDashboardPath('/patient/dashboard');
              break;
            case 'hospital':
              setDashboardPath('/hospital/dashboard');
              break;
            case 'ngo':
              setDashboardPath('/ngo/dashboard');
              break;
            case 'blood-bank':
              setDashboardPath('/bloodbank/dashboard');
              break;
            default:
              setDashboardPath('/');
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);


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
        <Link to="/" className="text-2xl font-bold text-red-600">BloodCare</Link>

        {/* Center: Navigation */}
        <nav className="flex-1 flex justify-center">
            <div className="hidden md:flex gap-8 text-gray-700 font-medium [&>a:hover]:text-red-600">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</Link>
            <Link to="/about">About</Link>
            <Link to="/how-it-works">How It Works</Link>
            {isLoggedIn ? (
              <Link to={dashboardPath}>Dashboard</Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </div>
        </nav>

        <div className="hidden md:flex gap-3 items-center">
          {isLoggedIn ? (
            <Link to={dashboardPath} aria-label="Dashboard" title="Dashboard" className="w-10 h-10 flex items-center justify-center rounded-md bg-red-600 text-white hover:bg-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </Link>
          ) : (
            <>
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
            </>
          )}
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
            {isLoggedIn ? (
              <Link to={dashboardPath} className="text-gray-600 font-medium">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 font-medium">Login</Link>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={handleJoinDonor}>
                  Register as Donor
                </button>
                <button className="px-4 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50" onClick={handleRequestBlood}>
                  Request Blood
                </button>
              </>
            )}
          </nav>
        )}
      </header>
    );
  }

  export default Header;
