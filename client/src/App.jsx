import { StrictMode, useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'

// Protected
import ProtectedRoute from "./routes/ProtctedRoutes";
import Unauthorized from './pages/unAuthorized'

// Home
import Home from './pages/Home/Home'

// Authentication
import Register from './pages/Auth/Register'
import RegisterOptions from './pages/Auth/RegisterOptions'
import Login from './pages/Auth/Login'

// Donor
import DonorDashboard from './pages/Donor/DonorDashboard'
import DonorDonationHistory from './pages/Donor/DonorDonationHistory'
import DonorAvailableCamps from './pages/Donor/DonorAvailableCamps'
import DonorProfileSettings from './pages/Donor/DonorProfileSettings'
import DonorRequests from './pages/Donor/DonorRequests';
import AllInstitutionsPage from './pages/Donor/AllInstitutionsPage';

// Patient
import PatientDashboard from './pages/Patient/PatientDashboard'
import RequestBloodPage from './pages/Patient/RequestBloodPage'
import PatientProfileSettings from './pages/Patient/PatientProfileSettings';
import NearbyDonors from './pages/Patient/NearbyDonors'
import BloodRequestTable from './pages/Patient/BloodHistory';
import ApprovedDonor from './pages/Patient/ApprovedDonor'

// Hospital
import HospitalDashboard from './pages/Hospital/HospitalDashboard'
import HospitalAnalytics from './pages/Hospital/HospitalAnalytics';
import HospitalApprovedDonor from './pages/Hospital/HospitalApprovedDonor';
import HospitalInventory from './pages/Hospital/HospitalInventory';
import HospitalManageRequest from './pages/Hospital/HospitalManageRequest';

// NGO
import NGODashboard from './pages/NGO/NGODashboard'
import NgoDonorRecords from './pages/NGO/NgoDonorRecords';
import NgoReports from './pages/NGO/NgoReports';
import OrganizeCamp from './pages/NGO/OrganizeCamp';
import VolunteerList from './pages/NGO/VolunteerList';

// BloodBank
import BloodBankDashboard from './pages/BloodBank/BloodBankDashboard'
import BloodBankReports from './pages/BloodBank/BloodBankReports';
import BloodBankRequest from './pages/BloodBank/BloodBankRequest';
import HospitalLinked from './pages/BloodBank/HospitalLinked';
import ManageInventory from './pages/BloodBank/ManageInventory';



function App() {
  return (

    // Public Routes
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register_options" element={<RegisterOptions />} />

      {/* Donor */}
      <Route element={<ProtectedRoute allowedRoles={["donor"]} />}>
        <Route path="/donor/dashboard" element={<DonorDashboard />} />
        <Route path="/donor/history" element={<DonorDonationHistory />} />
        <Route path="/donor/profile" element={<DonorProfileSettings />} />
        <Route path="/donor/camps" element={<DonorAvailableCamps />} />
        <Route path="/donor/requests" element={<DonorRequests />} />
        <Route path="/donor/all-institutions" element={<AllInstitutionsPage />} />
      </Route>

      {/* Patient */}
      <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/blood_history" element={<BloodRequestTable />} />
        <Route path="/patient/profile" element={<PatientProfileSettings />} />
        <Route path="/patient/request_blood" element={<RequestBloodPage />} />
        <Route path="/patient/nearby_donors" element={<NearbyDonors />} />
        <Route path="/patient/approved-donors" element={<NearbyDonors />} />
      </Route>

      {/* Hospital */}
      <Route element={<ProtectedRoute allowedRoles={["hospital"]} />}>
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/hospital/analytics" element={<HospitalAnalytics />} />
        <Route path="/hospital/approved_donors" element={<HospitalApprovedDonor />} />
        <Route path="/hospital/inventory" element={<HospitalInventory />} />
        <Route path="/hospital/requests" element={<HospitalManageRequest />} />
      </Route>

      {/* NGO */}
      <Route element={<ProtectedRoute allowedRoles={["ngo"]} />}>
        <Route path="/ngo/dashboard" element={<NGODashboard />} />
        <Route path="/ngo/donor_records" element={<NgoDonorRecords />} />
        <Route path="/ngo/reports" element={<NgoReports />} />
        <Route path="/ngo/organize_camps" element={<OrganizeCamp />} />
        <Route path="/ngo/volunteer_list" element={<VolunteerList />} />
      </Route>


      {/* Blood Bank */}
      <Route element={<ProtectedRoute allowedRoles={["blood-bank"]} />}>
        <Route path="/bloodbank/dashboard" element={<BloodBankDashboard />} />
        <Route path="/bloodbank/reports" element={<BloodBankReports />} />
        <Route path="/bloodbank/requests" element={<BloodBankRequest />} />
        <Route path="/bloodbank/hospital_linked" element={<HospitalLinked />} />
        <Route path="/bloodbank/inventory" element={<ManageInventory />} />
      </Route>



      {/* Unauthorized / Fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
    </Routes>
  )
}

export default App








