import React from "react";
import { useNavigate } from "react-router-dom"; 
const UrgentRequestCard = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-red-500 text-white rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h2 className="text-2xl font-bold">Need Blood Urgently?</h2>
        <p className="mt-2 text-sm">
          Connect with verified donors in your area instantly
        </p>
        <button className="mt-4 bg-white text-red-600 font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
        onClick={() => navigate("/patient/request_blood")}
        >
          Request Blood Now
        </button>
      </div>
      <img
        src="https://cdn-icons-png.flaticon.com/512/3004/3004458.png"
        alt="Blood donation"
        className="w-48 md:w-56"
      />
    </section>
  );
};

export default UrgentRequestCard;
