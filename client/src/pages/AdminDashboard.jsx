import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { logout, deleteAccount } from "../../../api/controllers/auth.controller";
import { useAuth } from "../components/AuthContext";
import { supabase } from "../../supabase";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pendingAgencies, setPendingAgencies] = useState([]);

  useEffect(() => {
    const fetchPendingAgencies = async () => {
      try {
        const { data, error } = await supabase
          .from("agencies")
          .select("id, agency_name, contact_number, website, status, user_id")
          .eq("status", "pending");

        
          if (error) {
            console.error("🚨 Supabase Fetch Error:", error.message);
            return;
          }
    
          console.log("✅ Supabase Response:", data); // 🔹 Debugging log
          setPendingAgencies(data || []); // 🔹 Store fetched data in state
        } catch (err) {
          console.error("🚨 Unexpected Error:", err.message);
        }
      };
    
      fetchPendingAgencies();
    }, []);


  // ✅ Approve Agency
  const approveAgency = async (agencyId) => {
    try {
      const { error } = await supabase
        .from("agencies")
        .update({ status: "approved" })
        .eq("id", agencyId);

      if (error) throw error;

      setPendingAgencies((prev) => prev.filter((agency) => agency.id !== agencyId));
    } catch (err) {
      console.error("Error approving agency:", err.message);
    }
  };

  // ✅ Reject Agency
  const rejectAgency = async (agencyId) => {
    try {
      const { error } = await supabase
        .from("agencies")
        .delete()
        .eq("id", agencyId);

      if (error) throw error;

      setPendingAgencies((prev) => prev.filter((agency) => agency.id !== agencyId));
    } catch (err) {
      console.error("Error rejecting agency:", err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your admin account? This action is irreversible!")) {
      try {
        await deleteAccount();
        navigate("/sign-up");
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl h-screen mx-auto bg-purple-100 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <h2 className="text-xl mt-4">Pending Agency Approvals</h2>

      {pendingAgencies.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        <ul>
          {pendingAgencies.map((agency) => (
            <li key={agency.id} className="border p-3 rounded-md shadow-md my-3">
              <strong>{agency.agency_name}</strong> - {agency.contact_number}
              <p>Contact: {agency.contact_number}</p>
              <p>Website: {agency.website}</p>
              <p>Status: {agency.status}</p>
              <button
                onClick={() => approveAgency(agency.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-md mt-2 mr-2"
              >
                Approve
              </button>
              <button
                onClick={() => rejectAgency(agency.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-md mt-2"
              >
                Reject
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-around">
        <button onClick={handleLogout} className="mt-4 bg-[#C05621] text-white font-bold px-4 py-2 rounded-lg">
          Sign Out
        </button>
        <button onClick={handleDeleteAccount} className="mt-4 bg-[#C05621] text-white font-bold px-4 py-2 rounded-lg">
          Delete Account
        </button>
      </div>
    </div>
  );
}
