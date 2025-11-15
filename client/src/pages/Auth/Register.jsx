import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import socket from "../../socket"; // your socket.js file

import axios from "axios";


// Static data for dropdowns
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const genders = ["Male", "Female", "Other"];
const cities = [
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Surat", state: "Gujarat" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Delhi", state: "Delhi" },
  { name: "Bangalore", state: "Karnataka" },
];
const idProofTypes = ["Aadhaar Card", "PAN Card", "Driving License", "Voter ID", "Passport"];
const medicalConditions = [
  "Fully Fit",
  "HIV",
  "Hepatitis B",
  "Hepatitis C",
  "Cancer (certain types)",
  "Cardiac Condition",
];
const diseases = [
  "Fully Fit",
  "Cancer",
  "HIV",
  "Hepatitis B",
  "Hepatitis C",
  "Cardiac Condition",
  "Diabetes",
  "Hypertension",
];
const ngoTypes = ["Charitable", "Service", "Participatory", "Empowering"];
const yesNo = ["Yes", "No"];

const roleDisplayLabel = {
  donor: "Donor",
  patient: "Patient",
  ngo: "NGO",
  hospital: "Hospital",
  bloodbank: "Blood Bank",
};

function getFieldsByRole(role) {
  switch (role) {
    case "donor":
    case "patient":
      return [
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "gender", label: "Gender", type: "select", options: genders, required: true },
        { name: "dob", label: "Date of Birth", type: "date", required: false },
        { name: "age", label: "Age", type: "number", required: true, readOnly: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: true },
        { name: "address", label: "Address", type: "text", required: true },
        { name: "city", label: "City", type: "select", options: cities.map((c) => c.name), required: true },
        { name: "state", label: "State", type: "text", required: true, readOnly: true },
        { name: "pincode", label: "Pincode", type: "text", required: false },
        ...(role === "donor" ? [
          { name: "weight", label: "Weight (kg)", type: "number", required: true },
          { name: "disease", label: "Medical Status", type: "select", options: diseases, required: true }
        ] : []),
        { name: "idProofType", label: "ID Proof Type", type: "select", options: idProofTypes, required: true },
        { name: "idProofNumber", label: "ID Proof Number", type: "text", required: false },
        { name: "idProofFile", label: "ID Proof File", type: "file", required: true },
        // Passwords handled specially below!
        { name: "passwordsRow", label: "", type: "passwords", required: true }
      ];
    case "ngo":
      return [
        { name: "ngoName", label: "NGO Name", type: "text", required: true },
        { name: "registrationNumber", label: "Registration Number", type: "text", required: true },
        { name: "contactPerson", label: "Contact Person", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: true },
        { name: "address", label: "Address", type: "text", required: true },
        { name: "city", label: "City", type: "select", options: cities.map((c) => c.name), required: true },
        { name: "state", label: "State", type: "text", required: true, readOnly: true },
        { name: "pincode", label: "Pincode", type: "text", required: true },
        { name: "licenseDocument", label: "License Document", type: "file", required: true },
        { name: "typeOfWork", label: "Type of Work", type: "select", options: ngoTypes, required: false },
        { name: "passwordsRow", label: "", type: "passwords", required: true }
      ];
    case "hospital":
      return [
        { name: "hospitalName", label: "Hospital Name", type: "text", required: true },
        { name: "registrationNumber", label: "Registration Number", type: "text", required: true },
        { name: "contactPerson", label: "Contact Person", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: true },
        { name: "address", label: "Address", type: "text", required: true },
        { name: "city", label: "City", type: "select", options: cities.map((c) => c.name), required: true },
        { name: "state", label: "State", type: "text", required: true, readOnly: true },
        { name: "pincode", label: "Pincode", type: "text", required: true },
        { name: "licenseFile", label: "License File", type: "file", required: true },
        { name: "hasBloodBank", label: "Has Blood Bank", type: "select", options: yesNo, required: false },
        { name: "passwordsRow", label: "", type: "passwords", required: true }
      ];
    case "bloodbank":
      return [
        { name: "bloodBankName", label: "Blood Bank Name", type: "text", required: true },
        { name: "licenseNumber", label: "License Number", type: "text", required: true },
        { name: "contactPerson", label: "Contact Person", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone", type: "tel", required: true },
        { name: "address", label: "Address", type: "text", required: true },
        { name: "city", label: "City", type: "select", options: cities.map((c) => c.name), required: true },
        { name: "state", label: "State", type: "text", required: true, readOnly: true },
        { name: "pincode", label: "Pincode", type: "text", required: true },
        { name: "hasBloodBank", label: "Has Blood Bank", type: "select", options: yesNo, required: false },
        { name: "passwordsRow", label: "", type: "passwords", required: true }
      ];
    default:
      return [];
  }
}

function validateField(field, value, allData, role) {
  switch (field) {
    case "fullName":
    case "ngoName":
    case "hospitalName":
    case "bloodBankName":
    case "contactPerson":
    case "registrationNumber":
    case "licenseNumber":
      if (!value) return "This field is required";
      break;
    case "gender":
    case "bloodGroup":
    case "city":
    case "state":
    case "idProofType":
    case "licenseDocument":
    case "licenseFile":
    case "idProofFile":
      if (!value) return "This field is required";
      break;
    case "age":
      if (!value && allData.dob) return "Age is required";
      if (value && (isNaN(value) || value < 18 || value > 60))
        return "Age must be between 18 and 60";
      break;
    case "weight":
      if (!value) return "Weight is required";
      if (isNaN(value) || value < 45)
        return "Sorry you are underweight. Minimum weight required is 45 kg. You are not eligible to donate blood.";
      break;
    case "disease":
      if (!value) return "Medical status is required";
      if (value !== "Fully Fit") {
        const ineligibleDiseases = ["Cancer", "HIV", "Hepatitis B", "Hepatitis C", "Cardiac Condition", "Diabetes", "Hypertension"];
        if (ineligibleDiseases.includes(value)) {
          return `You are not eligible for donation due to: ${value}. Please consult with a medical professional.`;
        }
      }
      break;
    case "email":
      if (!value) return "This field is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Invalid email address";
      break;
    case "phone":
      if (!value) return "This field is required";
      if (!/^\d{10}$/.test(value)) return "Invalid phone number";
      break;
    case "address":
      if (!value) return "This field is required";
      break;
    case "pincode":
      if (value && !/^\d{6}$/.test(value)) return "Invalid pincode";
      break;
    case "idProofNumber":
      if (!value && allData.idProofType && allData.idProofType !== "")
        return "ID Proof Number required";
      break;
    case "medicalCondition":
      if (!value) return "This field is required";
      if (
        (role === "donor" || role === "patient") &&
        value !== "Fully Fit"
      )
        return `You are not eligible for registration because of: ${value}`;
      break;
    case "password":
      if (!value) return "Password is required";
      if (value.length < 6) return "Password should be at least 6 characters";
      break;
    case "confirmPassword":
      if (!value) return "Confirm your password";
      if (value !== allData.password) return "Passwords do not match";
      break;
    default:
      break;
  }
  return "";
}

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const normalizedRole = (role || "").replace("-", "").toLowerCase();
  const fields = getFieldsByRole(normalizedRole);

  // for real time update
  const [users, setUsers] = useState([]);
  useEffect(() => {
    socket.on("userRegistered", (newUser) => {
      setUsers((prev) => [...prev, newUser]); // instantly add new user
    });

    return () => socket.off("userRegistered");
  }, []);


  // Exclude passwordsRow pseudo-field for init state
  const actualFields = fields.filter((f) => f.type !== "passwords");
  const [formData, setFormData] = useState(() =>
    Object.fromEntries([
      ...actualFields.map((f) => [f.name, f.type === "file" ? null : ""]),
      ["password", ""],
      ["confirmPassword", ""],
    ])
  );
  const [fieldTouched, setFieldTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState({});

  // Calculate Age from DOB
  useEffect(() => {
    if ("dob" in formData && formData.dob) {
      const dob = new Date(formData.dob);
      const now = new Date();
      let age = now.getFullYear() - dob.getFullYear();
      const hasHadBirthday =
        now.getMonth() > dob.getMonth() ||
        (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
      if (!hasHadBirthday) age--;
      age = age >= 0 ? age : "";
      setFormData((fd) => ({ ...fd, age }));
      setFieldErrors((fe) => ({
        ...fe,
        age: validateField(
          "age",
          age,
          { ...formData, age },
          normalizedRole
        ),
      }));
    }
    // eslint-disable-next-line
  }, [formData.dob]);

  // Auto-fill state from city selection
  useEffect(() => {
    if ("city" in formData && formData.city) {
      const selectedCity = cities.find((c) => c.name === formData.city);
      setFormData((fd) => ({
        ...fd,
        state: selectedCity ? selectedCity.state : "",
      }));
      setFieldErrors((fe) => ({
        ...fe,
        state: validateField(
          "state",
          selectedCity ? selectedCity.state : "",
          { ...formData, state: selectedCity ? selectedCity.state : "" },
          normalizedRole
        ),
      }));
    }
    // eslint-disable-next-line
  }, [formData.city]);

  // Validate fields on change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let val = type === "file" ? files[0] : value;
    setFormData((fd) => {
      const updated = { ...fd, [name]: val };
      setFieldErrors((err) => ({
        ...err,
        [name]: validateField(name, val, updated, normalizedRole),
      }));
      return updated;
    });
    setFieldTouched((ft) => ({ ...ft, [name]: true }));
  };

  // Validate fields on blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setFieldTouched((ft) => ({ ...ft, [name]: true }));
    setFieldErrors((fe) => ({
      ...fe,
      [name]: validateField(
        name,
        formData[name],
        formData,
        normalizedRole
      ),
    }));
  };

  // All validation for submit
  const allValid =
    [...actualFields, { name: "password", required: true }, { name: "confirmPassword", required: true }]
      .filter((f) => f.required)
      .every((f) => !validateField(f.name, formData[f.name], formData, normalizedRole));

  // If submit is disabled and clicked, show all errors
  const handleDisabledSubmit = (e) => {
    e.preventDefault();
    const allTouch = {};
    const newErrs = {};
    [...actualFields, { name: "password", required: true }, { name: "confirmPassword", required: true }].forEach((f) => {
      allTouch[f.name] = true;
      newErrs[f.name] = validateField(
        f.name,
        formData[f.name],
        formData,
        normalizedRole
      );
    });
    setFieldTouched(allTouch);
    setFieldErrors(newErrs);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const fd = new FormData();

    let payload = { ...formData }; // start with form data

    // Map organization name field to 'fullName' for backend
    if (normalizedRole === "bloodbank") {
      payload.fullName = formData.bloodBankName;
    } else if (normalizedRole === "hospital") {
      payload.fullName = formData.hospitalName;
    } else if (normalizedRole === "ngo") {
      payload.fullName = formData.ngoName;
    }

    // Role value normalization for backend
    payload.role = normalizedRole === "bloodbank" ? "blood-bank" : normalizedRole;

    // Now add fields to FormData
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        fd.append(key, value);
      }
    });

    const res = await axios.post("http://localhost:8080/api/user/register", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert(res?.data?.message || "Registration successful!");

    setTimeout(() => {
      navigate("/login");
    }, 200);
  } catch (err) {
    console.error("Registration Error:", err.response?.data || err.message);
    alert(err.response?.data?.message || "Registration failed! Please try again.");
  }
};

  if (!fields.length)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-lg">Invalid registration role!</div>
      </div>
    );



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-6 sm:p-8 mt-8">
        <h2 className="text-center text-2xl font-semibold text-red-600 mb-2">
          Register as {roleDisplayLabel[normalizedRole] || "User"}
        </h2>
        <p className="text-center text-gray-500 mb-6 text-sm">
          Create your account to save lives
        </p>
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4"
          onSubmit={handleSubmit}
        >
          {fields.map((field, idx) => {
            // Special passwords row (always last)
            if (field.type === "passwords") {
              return (
                <div className="sm:col-span-2" key={field.name}>
                  <div className="flex flex-col sm:flex-row gap-4">
                    {["password", "confirmPassword"].map((pwname) => (
                      <div className="w-full" key={pwname}>
                        <label className="block mb-1 font-medium text-gray-700">
                          {pwname === "password"
                            ? "Password"
                            : "Confirm Password"}
                          *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword[pwname] ? "text" : "password"}
                            name={pwname}
                            value={formData[pwname]}
                            minLength={6}
                            required
                            autoComplete="new-password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-lg border px-4 py-2 focus:outline-none ${fieldTouched[pwname] && fieldErrors[pwname]
                              ? "border-red-400"
                              : "border-gray-300"
                              }`}
                          />
                          <button
                            type="button"
                            className="absolute right-2 top-2 text-sm text-gray-500 select-none"
                            tabIndex={-1}
                            onClick={() =>
                              setShowPassword((p) => ({
                                ...p,
                                [pwname]: !p[pwname],
                              }))
                            }
                          >
                            {showPassword[pwname] ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {fieldTouched[pwname] && fieldErrors[pwname] && (
                          <div className="text-red-600 text-xs">
                            {fieldErrors[pwname]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            const { name, label, type, options, required, readOnly } = field;
            const error =
              fieldTouched[name] && fieldErrors[name] ? fieldErrors[name] : "";

            if (type === "select") {
              return (
                <div key={name}>
                  <label className="block mb-1 font-medium text-gray-700">
                    {label}
                    {required && "*"}
                  </label>
                  <select
                    className={`w-full rounded-lg border px-4 py-2 focus:outline-none ${error ? "border-red-400" : "border-gray-300"
                      }`}
                    name={name}
                    value={formData[name]}
                    disabled={readOnly}
                    required={required}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <option value="">Select {label}</option>
                    {options.map((op) => (
                      <option value={op} key={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  {error && (
                    <div className="text-red-600 text-xs">{error}</div>
                  )}
                </div>
              );
            }
            if (type === "file") {
              return (
                <div key={name}>
                  <label className="block mb-1 font-medium text-gray-700">
                    {label}
                    {required && "*"}
                  </label>
                  <input
                    type="file"
                    name={name}
                    required={required}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full py-1"
                  />
                  {error && (
                    <div className="text-red-600 text-xs">{error}</div>
                  )}
                </div>
              );
            }
            return (
              <div key={name}>
                <label className="block mb-1 font-medium text-gray-700">
                  {label}
                  {required && "*"}
                </label>
                <input
                  type={type === "date" ? "date" : type}
                  name={name}
                  value={type === "file" ? undefined : formData[name]}
                  required={required}
                  readOnly={readOnly}
                  min={type === "number" && name === "age" ? 1 : undefined}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none ${error ? "border-red-400" : "border-gray-300"
                    }`}
                  placeholder={
                    type === "date"
                      ? "dd-mm-yyyy"
                      : type === "number" && name === "age"
                        ? ""
                        : label
                  }
                />
                {error && (
                  <div className="text-red-600 text-xs">{error}</div>
                )}
              </div>
            );
          })}
          <div className="sm:col-span-2">
            <button
              className={`w-full py-2 mt-2 rounded-lg font-semibold ${allValid
                ? "bg-red-600 text-white hover:bg-red-700 transition"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              type="submit"
              disabled={!allValid}
              onClick={allValid ? undefined : handleDisabledSubmit}
            >
              Submit &amp; Create Account
            </button>
          </div>
        </form>
        <div className="text-center mt-3 text-sm">
          Already have an account?
          <span
            className="text-red-600 underline cursor-pointer ml-1"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </div>
      </div>
    </div>
  );
}