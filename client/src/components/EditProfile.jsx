import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { useAuth } from "../components/AuthContext";

export default function EditProfile() {
  const { user, role } = useAuth(); // Get current user & role
  const [formData, setFormData] = useState({});
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // **Fetch Current User Data**
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      let query;
      if (role === "agency") {
        query = supabase
          .from("agencies")
          .select("agency_name, contact_number, website, description, status")
          .eq("user_id", user.id)
          .single();
      } else if (role === "admin") {
        query = supabase
          .from("admins")
          .select("email, admin_code, created_at")
          .eq("user_id", user.id)
          .single();
      } else {
        query = supabase
          .from("users")
          .select("fullname, email, avatar")
          .eq("id", user.id)
          .single();
      }

      const { data, error } = await query;
      if (error) {
        console.error("❌ Error fetching profile:", error.message);
      } else {
        setFormData(data || {}); // ✅ Ensure form is updated with current data
      }
    };

    fetchProfile();
  }, [user, role]); // ✅ Runs whenever user or role changes

  // **Handle Input Change**
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // **Handle Profile Update**
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    let table = "users";
    let updateData = { ...formData };

    if (role === "agency") {
      table = "agencies";
      updateData = {
        agency_name: formData.agency_name,
        contact_number: formData.contact_number,
        website: formData.website,
        description: formData.description,
      };
    } else if (role === "admin") {
      table = "admins";
      updateData = {}; // Admins have only read-only fields
    }

    const { error } = await supabase
      .from(table)
      .update(updateData)
      .eq(role === "agency" ? "user_id" : "id", user.id);

    if (error) {
      console.error("❌ Error updating profile:", error.message);
      setMessage("Failed to update profile.");
    } else {
      setMessage("✅ Profile updated successfully!");
    }

    setLoading(false);
  };

  // **Handle Password Update**
  const handlePasswordUpdate = async () => {
    if (!password) return setMessage("Enter a new password.");
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error("❌ Error updating password:", error.message);
      setMessage("Failed to update password.");
    } else {
      setMessage("✅ Password updated successfully!");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-purple-900 text-center">Edit Profile</h2>

      {message && <p className="text-center mt-2 text-green-600">{message}</p>}

      <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-4">
        {/* Full Name (For Users) */}
        {role === "user" && (
          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname || ""}
            onChange={handleChange}
            required
            className="border p-2 rounded-lg"
          />
        )}

        {/* Agency Name (For Agencies) */}
        {role === "agency" && (
          <input
            type="text"
            name="agency_name"
            placeholder="Agency Name"
            value={formData.agency_name || ""}
            onChange={handleChange}
            required
            className="border p-2 rounded-lg"
          />
        )}

        {/* Email (For Users & Admins - Read-Only) */}
        {(role === "user" || role === "admin") && (
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email || ""}
            readOnly
            className="border p-2 rounded-lg bg-gray-200"
          />
        )}

        {/* Contact Number (For Agencies & Users) */}
        {(role === "agency" || role === "user") && (
          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number || ""}
            onChange={handleChange}
            className="border p-2 rounded-lg"
          />
        )}

        {/* Website (For Agencies Only) */}
        {role === "agency" && (
          <input
            type="text"
            name="website"
            placeholder="Website"
            value={formData.website || ""}
            onChange={handleChange}
            className="border p-2 rounded-lg"
          />
        )}

        {/* Description (For Agencies Only) */}
        {role === "agency" && (
          <textarea
            name="description"
            placeholder="Agency Description"
            value={formData.description || ""}
            onChange={handleChange}
            className="border p-2 rounded-lg"
          ></textarea>
        )}

        {/* Status (For Agencies - Read-Only) */}
        {role === "agency" && (
          <input
            type="text"
            name="status"
            placeholder="Status"
            value={formData.status || ""}
            readOnly
            className="border p-2 rounded-lg bg-gray-200"
          />
        )}

        {/* Admin Code (For Admins - Read-Only) */}
        {role === "admin" && (
          <input
            type="text"
            name="admin_code"
            placeholder="Admin Code"
            value={formData.admin_code || ""}
            readOnly
            className="border p-2 rounded-lg bg-gray-200"
          />
        )}

        <button type="submit" disabled={loading} className="bg-purple-900 text-white px-4 py-2 rounded-lg">
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>

      {/* Password Update Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold">Change Password</h3>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded-lg mt-2"
        />
        <button
          onClick={handlePasswordUpdate}
          className="bg-red-700 text-white px-4 py-2 rounded-lg mt-3"
        >
          Update Password
        </button>
      </div>
    </div>
  );
}
