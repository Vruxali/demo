import React from 'react'
import Navbar from '../../components/PatientComponent/Navbar'
import ApprovedDonorList from '../../components/Shared/ApprovedDonorList'
function ApprovedDonor() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <ApprovedDonorList />
    </div>
  )
}

export default ApprovedDonor
