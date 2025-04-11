import { useState } from "react";
import { signUp } from "../../../api/controllers/auth.controller.js"; // Ensure correct import
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [fullname, setFullname] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [description, setDescription] = useState("");


  // 🔹 Reset fields when role changes
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setAgencyName("");
    setContactNumber("");
    setWebsite("");
    setAdminCode("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 🔹 Validate Admin Secret Code
      if (role === "admin" && adminCode !== "SECRET123") {
        throw new Error("Invalid admin secret code!");
      }

      // 🔹 Collect required data
      let additionalData = { fullname, role }; // Ensure role is stored

      if (role === "agency") {
        additionalData = { ...additionalData, agency_name: agencyName, contact_number: contactNumber, website,  description: description || "N/A", status: "pending" };
      } else if (role === "admin") {
        additionalData = { ...additionalData, admin_code: adminCode };
      }

      // 🔹 Sign Up Function Call
      await signUp(email, password, role, additionalData);
      navigate("/sign-in"); // Redirect to login after successful signup
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200"
      style={{ backgroundImage: "url('./src/assets/images/trip.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>

      <div className="p-6 w-full max-w-xl mx-auto shadow-lg backdrop-blur-sm rounded-lg"
        style={{ backgroundColor: "rgba(181, 120, 88, 0.3)" }}>

        <div className='text-2xl text-red-950 text-center font-bold my-7'>
          Welcome to TripWise!
        </div>

        <h2 className="text-red-950 text-center font-bold my-7">Sign Up</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSignup} className='flex flex-col gap-4'>
          <input type="text" placeholder="Full Name" value={fullname} onChange={(e) => setFullname(e.target.value)} required className='border p-3 rounded-lg bg-orange-100 text-red-950' />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className='border p-3 rounded-lg bg-orange-100 text-red-950' />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className='border p-3 rounded-lg bg-orange-100 text-red-950' />

          {/* Role Selection */}
          <select onChange={handleRoleChange} value={role} required className='border p-3 rounded-lg bg-orange-100 text-red-950'>
            <option value="user">User</option>
            <option value="agency">Agency</option>
            <option value="admin">Admin</option>
          </select>

          {/* Additional Fields for Agency */}
          {role === "agency" && (
            <>
              <input type="text" placeholder="Agency Name" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} required className='border p-3 rounded-lg bg-orange-100 text-red-950' />
              <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required className='border p-3 rounded-lg bg-orange-100 text-red-950' />
              <input type="url" placeholder="Website URL" value={website} onChange={(e) => setWebsite(e.target.value)} className='border p-3 rounded-lg bg-orange-100 text-red-950' />
              <textarea placeholder="Agency Description" onChange={(e) => setDescription(e.target.value)} className="border p-3 rounded-lg bg-orange-100 text-red-950"
              />
            </>
          )}

          {/* Additional Fields for Admin */}
          {role === "admin" && (
            <>
              <input type="password" placeholder="Admin Secret Code" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required className='border p-3 rounded-lg bg-orange-100 text-red-950' />
            </>
          )}

          <button type="submit" disabled={loading} className='bg-red-950 text-white font-semibold p-3 rounded-lg uppercase hover:opacity-80 w-full disabled:opacity-80'>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-red-950 mt-4">Already have an account? <Link to={'/sign-in'} className="text-blue-700">Sign in</Link></p>
      </div>
    </div>
  );
}
