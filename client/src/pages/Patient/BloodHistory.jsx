import React from 'react'
import Navbar from '../../components/PatientComponent/Navbar'
import RequestHistory from '../../components/PatientComponent/RequestHistory'

function BloodHistory() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <RequestHistory />
    </div>
  )
}

export default BloodHistory
