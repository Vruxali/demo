import React from 'react';
import Header from '../components/Home/Header';
import Footer from '../components/Home/Footer';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h1>

        <section className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">1. Register</h3>
            <p className="text-gray-600">Sign up as a donor, patient, hospital, blood bank or NGO. Fill in basic details and verify your account.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">2. Search or Post Requests</h3>
            <p className="text-gray-600">Patients or hospitals can post blood requests. Donors and blood banks can search nearby requests to respond quickly.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">3. Coordinate & Donate</h3>
            <p className="text-gray-600">Join registered camps or contact requesters directly. Track donations and update availability in your profile.</p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Safety & Verification</h2>
          <p className="text-gray-600">We encourage institutions to verify their details. Donors should follow medical eligibility and safety checks before donation.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Help & Support</h2>
          <p className="text-gray-600">If you need help using the platform or have an urgent request, reach out to our support channels listed on the footer.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
