
// src/api/donationAPI.js

export async function getDonationStats() {
  // Simulated API (you'll replace this with fetch("https://yourapi.com/stats"))
  return {
    totalDonations: 12,
    livesSaved: 36,
    nextEligibleDate: "Dec 15",
    progress: 60,
    level: "Silver Donor",
  };
}

export async function getDonationHistory() {
  return [
    {
      id: 1,
      date: "Nov 18, 2024",
      time: "10:30 AM",
      location: "Central Blood Bank",
      address: "Downtown Medical Center",
      bloodType: "O+",
      status: "Completed",
    },
    {
      id: 2,
      date: "Sep 22, 2024",
      time: "2:15 PM",
      location: "Community Center",
      address: "Mobile Blood Drive",
      bloodType: "O+",
      status: "Completed",
    },
    {
      id: 3,
      date: "Jul 15, 2024",
      time: "9:00 AM",
      location: "Regional Hospital",
      address: "Emergency Collection",
      bloodType: "O+",
      status: "Completed",
    },
    {
      id: 4,
      date: "May 6, 2024",
      time: "11:45 AM",
      location: "University Campus",
      address: "Student Health Center",
      bloodType: "O+",
      status: "Processing",
    },
  ];
}

export async function getMilestones() {
  return [
    { id: 1, title: "First Donation", date: "Jan 2023", color: "bg-yellow-100 text-yellow-700" },
    { id: 2, title: "5 Donations", date: "Aug 2023", color: "bg-blue-100 text-blue-700" },
    { id: 3, title: "10 Donations", date: "Mar 2024", color: "bg-green-100 text-green-700" },
    { id: 4, title: "20 Donations", date: "Coming Soon", color: "bg-gray-100 text-gray-600" },
  ];
}
