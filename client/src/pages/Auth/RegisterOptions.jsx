import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaHeartbeat, FaHospitalAlt, FaVial, FaHandsHelping } from "react-icons/fa";

const roles = [
  { name: "Donor", icon: <FaUserPlus className="text-red-500 text-4xl" /> },
  { name: "Patient", icon: <FaHeartbeat className="text-red-500 text-4xl" /> },
  { name: "Hospital", icon: <FaHospitalAlt className="text-red-500 text-4xl" /> },
  { name: "Blood Bank", icon: <FaVial className="text-red-500 text-4xl" /> },
  { name: "NGO", icon: <FaHandsHelping className="text-red-500 text-4xl" /> },
];

const RegisterOptions = () => {
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    navigate(`/register/${role.toLowerCase()}`, { state: { role } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-10">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
        Register as:
      </h2>

      {/* First Row - Donor, Patient */}
      <div className="flex justify-center gap-8 mb-8 flex-wrap">
        {roles.slice(0, 2).map((role) => (
          <div
            key={role.name}
            onClick={() => handleRoleClick(role.name)}
            className="w-44 h-44 flex flex-col items-center justify-center bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            {role.icon}
            <h3 className="mt-3 font-semibold text-gray-800 text-lg">{role.name}</h3>
          </div>
        ))}
      </div>

      {/* Second Row - Hospital, Blood Bank, NGO */}
      <div className="flex justify-center gap-8 flex-wrap">
        {roles.slice(2).map((role) => (
          <div
            key={role.name}
            onClick={() => handleRoleClick(role.name)}
            className="w-44 h-44 flex flex-col items-center justify-center bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            {role.icon}
            <h3 className="mt-3 font-semibold text-gray-800 text-lg">{role.name}</h3>
          </div>
        ))}
      </div>

      {/* Footer Text */}
      <p className="mt-12 text-gray-600 text-sm">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-red-500 font-medium hover:underline cursor-pointer"
        >
          Login here
        </span>
      </p>
    </div>
  );
};

export default RegisterOptions;
