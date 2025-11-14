import React from "react";

function StatCard({ title, value }) {
  return (

    <div className="flex flex-col items-center justify-center bg-white  rounded-2xl shadow-sm w-full md:w-1/2 ">
     <button
    className="relative px-8 py-3 bg-red-600 text-white font-semibold text-lg rounded-full overflow-hidden shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
  >
    <span className="absolute inset-0 bg-red-500 opacity-0 hover:opacity-20 transition-opacity animate-pulse"></span>
    🩸 Request Blood
  </button>
    </div>

  );
}

export default StatCard;