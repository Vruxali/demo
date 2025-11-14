import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const cities = [
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Surat", state: "Gujarat" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Delhi", state: "Delhi" },
  { name: "Bangalore", state: "Karnataka" },
];

export default function RequestBlood() {
  const [form, setForm] = useState({
    patientName: "",
    age: "",
    gender: "",
    bloodGroup: "O+",
    contactNumber: "",
    email: "",
    city: "",
    state: "",
    hospitalName: "",
    hospitalAddress: "",
    doctorName: "",
    reason: "",
    unitsRequired: 1,
    dateRequired: "",
    notes: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const socketRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    socketRef.current = io("http://localhost:8080", { transports: ["polling"] });
    return () => socketRef.current.disconnect();
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "patientName":
      case "hospitalName":
      case "hospitalAddress":
      case "city":
      case "state":
      case "reason":
        if (!value) return "This field is required";
        break;
      case "contactNumber":
        if (!/^\d{10}$/.test(value)) return "Enter valid 10-digit number";
        break;
      case "email": {
        const v = (value || "").trim();
        if (!v) return ""; // optional field
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(v) ? "" : "Invalid email";
      }
      case "age":
        if (!value) return "Required";
        if (value < 1 || value > 120) return "Enter valid age";
        break;
      case "unitsRequired":
        if (value < 1) return "At least 1 unit required";
        break;
      case "dateRequired":
        if (!value) return "Select a date";
        break;
      case "notes":
        return ""; // optional
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      const selectedCity = cities.find((c) => c.name === value);
      const newState = selectedCity ? selectedCity.state : "";
      setForm((prev) => ({ ...prev, city: value, state: newState }));
      setErrors((prev) => ({
        ...prev,
        city: validateField("city", value),
        state: validateField("state", newState),
      }));
      return;
    }
    setForm({ ...form, [name]: value });
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const isValid =
    Object.keys(form).every((key) => !validateField(key, form[key])) &&
    Object.values(errors).every((v) => !v);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    const res = await fetch("http://localhost:8080/api/blood-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) return alert(data.message);
    alert("Blood request submitted!");
    socketRef.current.emit("requestCreatedClient", data.request);

    setForm({
      patientName: "",
      age: "",
      gender: "",
      bloodGroup: "O+",
      contactNumber: "",
      email: "",
      city: "",
      state: "",
      hospitalName: "",
      hospitalAddress: "",
      doctorName: "",
      reason: "",
      unitsRequired: 1,
      dateRequired: "",
      notes: "",
    });
    setTouched({});
    setErrors({});
  };

  const field = (label, name, type = "text", required = true, placeholder = "") => (
    <div>
      <label className="block font-medium mb-1 text-gray-700">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`border ${
          errors[name] ? "border-red-400 bg-red-50" : "border-gray-300"
        } rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-red-500 outline-none`}
      />
      {touched[name] && errors[name] && (
        <p className="text-xs text-red-600 mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
          <h1 className="text-2xl md:text-3xl font-bold">Request Blood</h1>
          <p className="text-red-100 text-sm">
            Fill the form below to raise a blood request
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-8 grid md:grid-cols-2 gap-6">
          <h2 className="md:col-span-2 text-xl font-semibold text-red-600">
            🩸 Patient Information
          </h2>

          {field("Full Name", "patientName", "text", true, "Enter patient's full name")}
          {field("Age", "age", "number", true, "Enter age")}
          <div>
            <label className="block font-medium mb-1 text-gray-700">Gender*</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border ${
                errors.gender ? "border-red-400 bg-red-50" : "border-gray-300"
              } rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-red-500 outline-none`}
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            {touched.gender && errors.gender && (
              <p className="text-xs text-red-600 mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Blood Group*
            </label>
            <select
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              onBlur={handleBlur}
              className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-red-500 outline-none"
            >
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>

          {field("Contact Number", "contactNumber", "tel", true, "Enter 10-digit number")}
          {field("Email (optional)", "email", "email", false, "Enter email if available")}
          <div>
            <label className="block font-medium mb-1 text-gray-700">City*</label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`border ${
                errors.city ? "border-red-400 bg-red-50" : "border-gray-300"
              } rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-red-500 outline-none`}
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
            {touched.city && errors.city && (
              <p className="text-xs text-red-600 mt-1">{errors.city}</p>
            )}
          </div>
          {field("State", "state", "text", true, "Auto-filled from city")}

          <h2 className="md:col-span-2 text-xl font-semibold text-red-600 mt-4">
            🏥 Medical / Request Details
          </h2>

          {field("Hospital Name", "hospitalName", "text", true, "Enter hospital name")}
          {field("Hospital Address", "hospitalAddress", "text", true, "Enter full hospital address")}
          {field("Doctor’s Name", "doctorName", "text", false, "Enter doctor's name (optional)")}
          {field("Reason for Blood Request", "reason", "text", true, "E.g. surgery, accident")}
          {field("Units Required", "unitsRequired", "number", true, "Enter number of units")}
          {field("Date When Required", "dateRequired", "date", true, "")}

          <div className="md:col-span-2">
            <label className="block font-medium mb-1 text-gray-700">
              Additional Notes (optional)
            </label>
            <textarea
              value={form.notes}
              name="notes"
              onChange={handleChange}
              onBlur={handleBlur}
              rows="3"
              placeholder="Any additional information (optional)"
              className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-red-500 outline-none"
            ></textarea>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={!isValid}
              className={`px-6 py-3 rounded-xl text-lg font-semibold transition ${
                isValid
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
