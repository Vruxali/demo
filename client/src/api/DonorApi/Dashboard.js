// Centralized mock API service. Replace fetch URLs later.

export async function fetchDonations() {
  // Simulate async data load
  return Promise.resolve([
    {
      date: "March 3, 2024",
      location: "City General Hospital",
      bloodType: "O+",
      status: "Completed",
      certificate: "Download",
    },
    {
      date: "February 15, 2024",
      location: "Red Cross Blood Center",
      bloodType: "O+",
      status: "Completed",
      certificate: "Download",
    },
    {
      date: "January 28, 2024",
      location: "Metro Blood Bank",
      bloodType: "O+",
      status: "Pending",
      certificate: "Processing",
    },
  ]);
}

export async function fetchHospitals() {
  return Promise.resolve([
    {
      name: "City General Hospital",
      distance: "1.2 km away",
      address: "123 Medical Center Dr.",
      status: "Open",
    },
    {
      name: "Red Cross Blood Center",
      distance: "2.1 km away",
      address: "456 Charity Ave.",
      status: "Open",
    },
    {
      name: "Metro Blood Bank",
      distance: "3.5 km away",
      address: "789 Health Plaza",
      status: "Closed",
    },
  ]);
}
