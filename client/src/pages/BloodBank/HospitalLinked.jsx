import React, { useEffect, useState, useMemo } from "react";
import Topbar from "../../components/BloodBankComponent/Navbar";
import api from "../../lib/api";
import { Building2, MapPin, Phone, Mail, User2, Search } from "lucide-react";

function HospitalCard({ hospital }) {
  const name = hospital.fullName || hospital.hospitalDetails?.name || "Hospital";
  const city = hospital.city || hospital.hospitalDetails?.city || "—";
  const address = hospital.hospitalDetails?.address || "Address not provided";
  const phone = hospital.hospitalDetails?.phone || hospital.phone || "";
  const email = hospital.hospitalDetails?.email || hospital.email || "";
  const contact = hospital.hospitalDetails?.contactPerson || "";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 w-full">
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-red-100 text-red-600 p-2 rounded-xl">
          <Building2 size={20} />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-lg text-gray-800 truncate">{name}</h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <MapPin size={16} className="mr-1.5 text-red-500 shrink-0" />
            <span className="truncate">{city}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-3">{address}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {contact && (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            <User2 size={14} /> {contact}
          </span>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
            <Phone size={14} /> {phone}
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">
            <Mail size={14} /> {email}
          </a>
        )}
      </div>

      <div className="bg-red-50 text-red-600 text-xs font-medium py-2 px-3 rounded-xl inline-block">
        Verified Institution
      </div>
    </div>
  );
}

function HospitalLinked() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const cities = useMemo(() => {
    const set = new Set(
      (hospitals || [])
        .map((h) => h.city || h.hospitalDetails?.city || "")
        .filter(Boolean)
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [hospitals]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (hospitals || []).filter((h) => {
      const name = (h.fullName || "").toLowerCase();
      const city = (h.city || h.hospitalDetails?.city || "").toLowerCase();
      const address = (h.hospitalDetails?.address || "").toLowerCase();
      const matchQ = !term || name.includes(term) || city.includes(term) || address.includes(term);
      const matchCity = !cityFilter || city === cityFilter.toLowerCase();
      return matchQ && matchCity;
    });
  }, [hospitals, q, cityFilter]);

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/blood-request/all-institutions");
      setHospitals(data.hospitals || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  return (
    <div>
      <Topbar />
      <div className="p-4">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-semibold">Linked Hospitals ({filtered.length})</h2>
            <p className="text-sm text-gray-500">All hospitals registered in the application</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full border rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                placeholder="Search by name, city, address"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="border rounded-xl py-2 px-3 text-sm min-w-40"
            >
              <option value="">All cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading hospitals...</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-500">No hospitals found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((h) => (
              <HospitalCard key={h._id} hospital={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalLinked;
