import { useNavigate } from "react-router-dom";
import { logout, deleteAccount } from "../../../api/controllers/auth.controller";
import { useAuth } from "../components/AuthContext";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/sign-in"); // Redirect to Sign-in Page
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteAccount();
        navigate("/sign-up"); // Redirect to Sign-up Page after deletion
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">User Dashboard</h1>
      <p>Welcome, {user?.email}</p>

      <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">
        Sign Out
      </button>

      <button onClick={handleDeleteAccount} className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg">
        Delete Account
      </button>
    </div>
  );
}
