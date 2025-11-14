import React from 'react'
import Navbar from '../../components/HospitalComponent/Navbar'
import ManageRequests from './../../components/Shared/ManageRequests';
function HospitalManageRequest() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <ManageRequests />
    </div>
  )
}

export default HospitalManageRequest
