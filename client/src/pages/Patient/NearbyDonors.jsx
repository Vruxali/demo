import React from 'react'
import Navbar from '../../components/PatientComponent/Navbar'
import ApprovedDonorList from '../../components/Shared/ApprovedDonorList'

function NearbyDonors() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <ApprovedDonorList />
    </div>
  )
}

export default NearbyDonors
