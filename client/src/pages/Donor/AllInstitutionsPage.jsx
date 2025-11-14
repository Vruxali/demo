import React from 'react'
import AllInstitutions from '../../components/DonorComponent/AllInstitutions'
import Navbar from '../../components/DonorComponent/Navbar'

function AllInstitutionsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <AllInstitutions />
        </div>
    )
}

export default AllInstitutionsPage
