import React from 'react'
import Navbar from "../../components/PatientComponent/Navbar"
import RequestBlood from '../../components/Shared/RequestBlood'

function RequestBloodPage() {
    return (

        <div className="min-h-screen bg-gray-50">
            <Navbar/>
            <RequestBlood />
        </div>

    )
}

export default RequestBloodPage
