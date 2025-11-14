import Navbar from "../../components/DonorComponent/Navbar";
import RequestBloodForm from "../../components/PatientComponent/RequestBloodForm";

function DonorRequestBlood() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <RequestBloodForm/>
    </div>
  );
}

export default DonorRequestBlood;
