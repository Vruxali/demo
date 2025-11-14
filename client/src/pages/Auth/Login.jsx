import { Mail, Lock, Droplet, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Local states
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterActive, setIsRegisterActive] = useState(false);

  // --- handle login ---
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/api/user/login", { email, password });
    const { token, user } = res.data;

    if (!token || !user) {
      alert("Invalid response from server");
      return;
    }

    // Store login in context and localStorage for persistence
    login(user, token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Navigate by role
    const role = user.role?.toLowerCase();
    switch (role) {
      case "donor":
        navigate("/donor/dashboard");
        break;
      case "patient":
        navigate("/patient/dashboard");
        break;
      case "hospital":
        navigate("/hospital/dashboard");
        break;
      case "ngo":
        navigate("/ngo/dashboard");
        break;
      case "blood-bank":
        navigate("/bloodbank/dashboard");
        break;
      default:
        navigate("/");
    }
  } catch (err) {
    console.error("Login failed:", err);
    alert(err.response?.data?.message || "Login failed");
  }
};


  // --- UI ---
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section (Image + Quote) */}
      <div className="relative hidden lg:flex w-1/2 items-center justify-center">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/Login_img.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        <div className="relative z-10 text-white ml-20">
          <h1 className="text-6xl font-bold mb-3">Save Lives</h1>
          <h2 className="text-5xl font-semibold text-red-400 mb-5">
            Donate Blood
          </h2>
          <p className="text-gray-200 leading-relaxed max-w-md">
            Join our community of heroes making a difference. Every donation
            saves up to three lives.
          </p>
        </div>
      </div>

      {/* Right Section (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-b from-white to-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 shadow-xl rounded-2xl p-8 w-full max-w-md backdrop-blur-sm"
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-red-500 p-3 rounded-full">
              <Droplet className="text-white" size={26} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Sign in to your account and continue saving lives
          </p>

          {/* Tab Buttons */}
          <div className="relative flex mb-6 w-full max-w-md mx-auto">
            <div
              className={`absolute top-0 left-0 h-full w-1/2 bg-red-500 rounded-lg transition-transform duration-500 ease-in-out ${
                isRegisterActive ? "translate-x-full" : "translate-x-0"
              }`}
            ></div>

            <button
              type="button"
              onClick={() => setIsRegisterActive(false)}
              className={`relative z-10 w-1/2 py-2 font-semibold rounded-l-lg transition-colors duration-300 ${
                !isRegisterActive ? "text-white" : "text-gray-600"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterActive(true);
                setTimeout(() => navigate("/register_options"), 400);
              }}
              className={`relative z-10 w-1/2 py-2 font-semibold rounded-r-lg transition-colors duration-300 ${
                isRegisterActive ? "text-white" : "text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <Mail size={18} className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
              <Lock size={18} className="text-gray-400 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-700"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!email || !password}
            className={`w-full py-2.5 rounded-lg font-semibold text-white transition ${
              email && password
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
