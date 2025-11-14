import React from 'react';
import Header from '../components/Home/Header';
import Footer from '../components/Home/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">About BloodCare</h1>
        <p className="text-gray-600 mb-6">
          BloodCare is a community-driven platform that connects donors, hospitals, blood banks, NGOs and patients. Our goal is to make blood donation and requests easy, transparent and timely so patients can get the help they need.
        </p>

        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-600">To build a reliable network where donors and institutions coordinate seamlessly to save lives.</p>
        </section>

        <section className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Who We Serve</h2>
          <ul className="list-disc pl-5 text-gray-600">
            <li>Individual donors and volunteers</li>
            <li>Hospitals and clinics</li>
            <li>Blood banks and NGOs</li>
            <li>Patients in need of timely transfusions</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Get Involved</h2>
          <p className="text-gray-600">Register as a donor, organize or join blood camps, or partner as an institution to help your community.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
