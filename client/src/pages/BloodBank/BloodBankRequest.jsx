import React from 'react'
import Navbar from "../../components/BloodBankComponent/Navbar"
import ManageRequests from './../../components/Shared/ManageRequests';

function BloodBankRequest() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <ManageRequests />
    </div>
  )
}

export default BloodBankRequest
