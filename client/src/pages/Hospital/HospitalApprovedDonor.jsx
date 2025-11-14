import React from 'react'
import ApprovedDonorList from '../../components/Shared/ApprovedDonorList'
import Navbar from '../../components/HospitalComponent/Navbar'

function HospitalAprovedDonor() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <ApprovedDonorList />
    </div>
  )
}

export default HospitalAprovedDonor
