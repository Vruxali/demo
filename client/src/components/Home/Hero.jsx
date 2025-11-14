import React from 'react'
import { User, Link, Heart } from "lucide-react";  // For HowITWorks Section
import { UserPlus, HeartPulse, Building2, FlaskConical, Handshake } from "lucide-react";     // For Hero Section
// import { UserPlus, HeartPulse, Building2, FlaskConical, Handshake } from "lucide-react";  // For Features Section
import { CheckSquare, ShieldCheck, Lock, Clock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";



const roles = [
    { name: "Donor", path: "/register/donor", icon: <UserPlus className="text-red-600 w-8 h-8" /> },
    { name: "Patient", path: "/register/patient", icon: <HeartPulse className="text-red-600 w-8 h-8" /> },
    { name: "Hospital", path: "/register/hospital", icon: <Building2 className="text-red-600 w-8 h-8" /> },
    { name: "Blood Bank", path: "/register/bloodbank", icon: <FlaskConical className="text-red-600 w-8 h-8" /> },
    { name: "NGO", path: "/register/ngo", icon: <Handshake className="text-red-600 w-8 h-8" /> },
];

const howItWorksSteps = [  // For HowITWorks Section
    {
        title: "Register on Platform",
        icon: <User className="text-white w-6 h-6" />,
        description: "Create your profile and join our life-saving community in just a few clicks.",
    },
    {
        title: "Get Connected",
        icon: <Link className="text-white w-6 h-6" />,
        description: "Our smart matching system connects you with the right people at the right time.",
    },
    {
        title: "Save Lives",
        icon: <Heart className="text-white w-6 h-6" />,
        description: "Donate or receive blood easily and securely through our verified network.",
    },
];

const Featuresroles = [ // For Features Section
    {
        name: "Donor",
        icon: <UserPlus className="text-red-600 w-8 h-8" />,
        description: "Register and help save lives.",
    },
    {
        name: "Patient",
        icon: <HeartPulse className="text-red-600 w-8 h-8" />,
        description: "Request blood easily when you need it.",
    },
    {
        name: "Hospital",
        icon: <Building2 className="text-red-600 w-8 h-8" />,
        description: "Connect with verified donors efficiently.",
    },
    {
        name: "Blood Bank",
        icon: <FlaskConical className="text-red-600 w-8 h-8" />,
        description: "Track and provide blood units to facilities.",
    },
    {
        name: "NGO",
        icon: <Handshake className="text-red-600 w-8 h-8" />,
        description: "Organize donation camps and events.",
    }
];

const reasons = [   // For WhyChoose Section
    {
        icon: <CheckSquare className="text-red-600 w-5 h-5" />,
        title: "Easy Registration",
        description: "Quick and simple sign-up process for all users."
    },
    {
        icon: <ShieldCheck className="text-red-600 w-5 h-5" />,
        title: "Verified Profiles",
        description: "All users are verified for safety and authenticity."
    },
    {
        icon: <Lock className="text-red-600 w-5 h-5" />,
        title: "Secure Data",
        description: "Your personal information is protected with encryption."
    },
    {
        icon: <Clock className="text-red-600 w-5 h-5" />,
        title: "24/7 Access",
        description: "Platform available round the clock for emergencies."
    },
    {
        icon: <Users className="text-red-600 w-5 h-5" />,
        title: "Community Support",
        description: "Join a caring community dedicated to saving lives."
    },
];


function Main() {

    const navigate = useNavigate();
    const [hoveredRole, setHoveredRole] = useState(null);

    // for register button at the bottom
    const handleClick = () => {
        navigate("/register_options");
    };

    // for hero section buttons

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
        <div>
            {/* Hero Section */}
            <section className="flex flex-col-reverse md:flex-row justify-between items-center px-6 md:px-20 py-12 bg-gray-50">
                {/* Left Text Section */}
                <div className="md:w-1/2 space-y-6 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        One Platform to <span className="text-red-600">Save Lives</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-lg mx-auto md:mx-0">
                        Connecting donors, patients, hospitals, blood banks, and NGOs seamlessly for a healthier tomorrow.
                    </p>

                    {/* Icons Section */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                        {roles.map((role, index) => (
                            <div
                                key={index}
                                onClick={() => navigate(role.path)}
                                onMouseEnter={() => setHoveredRole(role.name)}
                                onMouseLeave={() => setHoveredRole(null)}
                                className={`flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-white shadow-md transition duration-300 cursor-pointer ${hoveredRole === role.name ? "shadow-lg scale-105" : ""
                                    }`}
                            >
                                {role.icon}
                                <p className="text-gray-800 font-semibold mt-2 text-center text-sm">{role.name}</p>
                            </div>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-6">
                        <button className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition"
                            onClick={handleJoinDonor}
                        >
                            Join as Donor
                        </button>
                        <button className="border border-red-600 text-red-600 px-5 py-2 rounded-md hover:bg-red-50 transition"
                            onClick={handleRequestBlood}
                        >
                            Request Blood
                        </button>
                    </div>
                </div>

                {/* Right Image */}
                <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
                    <img
                        src="/images/Blood_img.png"
                        alt="Doctors illustration"
                    // className="w-full max-w-md rounded-lg shadow-md"
                    />
                </div>
            </section>


            {/* How IT Works Section */}
            <section className="text-center py-16">
                <h2 className="text-3xl font-bold mb-3">How It Works</h2>
                <p className="text-gray-600 mb-10">Simple steps to save lives</p>
                <div className="flex justify-center gap-10">
                    {howItWorksSteps.map(({ title, icon, description }, idx) => (
                        <div key={idx} className="flex flex-col items-center max-w-xs">
                            <div className="bg-red-600 p-4 rounded-full mb-4">{icon}</div>
                            <h4 className="font-semibold text-lg mb-2">{title}</h4>
                            <p className="text-gray-600 text-sm">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-50 py-16 text-center">
                <h2 className="text-3xl font-bold mb-3">Who Can Use Our Platform?</h2>
                <p className="text-gray-600 mb-10">
                    Designed for everyone in the blood donation ecosystem
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 px-8 md:px-20">
                    {Featuresroles.map((Featuresroles, index) => (
                        <div
                            key={Featuresroles.name}
                            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col items-center"
                        >
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 shadow-inner mb-3">
                                {Featuresroles.icon}
                            </div>
                            <h3 className="font-semibold text-lg">{Featuresroles.name}</h3>
                            <p className="text-gray-600 text-sm">{Featuresroles.description}</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* Why Choose Us Section */}
            <section className="bg-white py-12 px-6 md:px-20 text-center">
                <h2 className="text-3xl font-bold mb-3">Why Choose BloodConnect?</h2>
                <p className="text-gray-600 mb-10">
                    Features that make blood donation simple and secure
                </p>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 text-center ">
                    {reasons.map(({ icon, title, description }, idx) => (
                        <div key={idx} className="flex flex-col items-center px-3">
                            <div className="mb-2 w-10 h-10 rounded-full bg-red-50 shadow-inner items-center justify-center flex">{icon}</div>
                            <h5 className="font-semibold mb-1 ">{title}</h5>
                            <p className="text-gray-600 text-sm ">{description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Register Section */}
            <section>
                <div className="bg-red-500 text-white text-center py-16 mt-4">
                    <h3 className="text-4xl font-bold mb-3">
                        Every Drop Counts — Join Us Today!
                    </h3>
                    <p className="mb-6">
                        Be part of a life-saving community that makes a difference every day.
                    </p>
                    <button
                        onClick={handleClick}
                        className="bg-white text-red-600 px-6 py-2 rounded-md font-semibold hover:bg-red-50"
                    >
                        Register Now
                    </button>

                </div>
            </section>
        </div>
    )
}

export default Main
