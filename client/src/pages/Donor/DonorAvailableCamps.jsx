import Navbar from "../../components/DonorComponent/Navbar";

function DonorAvailableCamps() {
  const camps = [
    { name: "City Hospital Camp", date: "Dec 12, 2024", location: "Medical Road" },
    { name: "Community Center Drive", date: "Jan 8, 2025", location: "Downtown" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Available Camps</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {camps.map((camp, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h3 className="font-semibold">{camp.name}</h3>
                <p className="text-gray-500">{camp.date} | {camp.location}</p>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 mt-3 sm:mt-0 rounded-lg hover:bg-red-700">
                Register
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DonorAvailableCamps