import { useNavigate } from "react-router-dom";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">Pending Approval</h1>
      <p>Your agency account is pending approval by an admin.</p>
      <button
        onClick={() => navigate("/sign-in")}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Back to Sign In
      </button>
    </div>
  );
}
