import { useNavigate } from "react-router-dom";
import { logout, deleteAccount } from "../../../api/controllers/auth.controller";
import { useAuth } from "../components/AuthContext";
import CreatePackageForm from "../components/CreatePackageForm";
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const { user, agencyId } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!agencyId) {
      console.warn("⚠️ No agency ID found, waiting for it...");
      return; // 🛑 Stop execution until agencyId is available
    }

    const fetchPackages = async () => {
      try {
        console.log(`🔍 Fetching packages for agency ID: ${agencyId}`);

        const { data, error } = await supabase
          .from("tour_packages") // ✅ Correct table name
          .select("*")
          .eq("agency_id", agencyId);

        if (error) throw error;
        console.log("✅ Fetched Tour Packages:", data);
        setPackages(data || []);
      } catch (err) {
        console.error("❌ Error fetching tour packages:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();

     // ✅ Add Real-time Listener for New Packages
  const subscription = supabase
  .channel("tour_packages_changes")
  .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "tour_packages" },
      (payload) => {
        console.log("🔄 Real-time update:", payload);
        if (payload.new.agency_id === agencyId) {
          setPackages((prev) => [...prev, payload.new]); // Append new package
        }; // Append new package
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };

  }, [agencyId]); // ✅ Fetch packages when agencyId is available

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await deleteAccount();
        navigate("/sign-up");
      } catch (error) {
        console.error("❌ Error deleting account:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl h-screen mx-auto bg-fuchsia-100 flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-fuchsia-900">Agency Dashboard</h1>
      <p>Welcome, {user?.email}</p>

      {/* Create Package Button */}
      <button
        className="bg-purple-900 text-white px-4 py-2 rounded mb-5"
        onClick={() => setShowForm(true)}
      >
        Create Package
      </button>

      {/* Render the form if showForm is true */}
      {showForm && <CreatePackageForm onClose={() => setShowForm(false)} />}

      <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Tour Packages</h2>

      {loading ? (
        <p>Loading packages...</p>
      ) : packages.length === 0 ? (
        <p className="text-gray-500">No packages found. Start by creating one!</p>
      ) : (
        <ul className="space-y-3">
          {packages.map((pkg) => (
            <li key={pkg.id} className="p-4 border bg-white shadow-md rounded-lg">
              <h3 className="font-bold text-xl text-gray-700">{pkg.title}</h3>
              <p><strong>Location:</strong> {pkg.location}</p>
              <p><strong>Price:</strong> ${pkg.price}</p>
              <p><strong>Duration:</strong> {pkg.duration} days</p>
              <p><strong>Category:</strong> {pkg.category}</p>
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => navigate("/edit-profile")} className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2">
        Edit Profile
      </button>

      <div className="flex justify-around">
        <button onClick={handleLogout} className="mt-4 bg-red-900 text-white px-4 py-2 rounded-lg">
          Sign Out
        </button>

        <button onClick={handleDeleteAccount} className="mt-4 bg-red-700 text-white px-4 py-2 rounded-lg">
          Delete Account
        </button>
      </div>
    </div>
  );
}
