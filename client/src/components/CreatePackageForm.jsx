import { useState } from "react";
import { supabase } from "../../supabase";
import { useAuth } from "../components/AuthContext";

export default function CreatePackageForm() {
  const { user, role, agencyId } = useAuth(); // ✅ Ensure agencyId is obtained correctly
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (role !== "agency" || !agencyId) {
        setError("🚨 Access Denied - Only verified agencies can create packages.");
        console.error("🚨 Access Denied - Role:", role, "Agency ID:", agencyId);
        return;
      }

    console.log("User Role:", role);
    console.log("Agency ID:", agencyId);

    console.log("Submitting Package Data:", {
        agency_id: agencyId,
        title,
        description,
        price: parseFloat(price),
        location,
        duration: parseInt(duration, 10),
        start_date: startDate,
        end_date: endDate,
        category,
        created_at: new Date().toISOString(),
      });

      try {
        const { data, error } = await supabase
          .from("tour_packages")
          .insert([
            {
              agency_id: agencyId,
              title,
              description,
              price,
              location,
              duration,
              start_date: startDate,
              end_date: endDate,
              category,
              created_at: new Date(),
            },
          ]);
          console.log("Category being inserted:", category);

        if (error) throw error;
  
        setSuccess("✅ Package Created Successfully!");
        console.log("✅ Package Created:", data);
      } catch (err) {
        setError("🚨 Error creating package: " + err.message);
        console.error("🚨 Error creating package:", err);
      }
    };


  return (
    <div>
      <h2>Create Tour Package</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    <form onSubmit={handleCreatePackage} className="flex flex-col gap-4">
      <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900"/>
      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900"/>
      <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900"/>
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900"/>
      <input type="number" placeholder="Duration (days)" value={duration} onChange={(e) => setDuration(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900"/>
      <input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900"/>
      <input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900"/>
      <select value={category} onChange={(e) => setCategory(e.target.value)} required className="bg-indigo-200 p-2 rounded-lg text-indigo-900">
        <option value="">Select Category</option>
        <option value="Cultural">Cultural</option>
        <option value="Historical">Historical</option>
        <option value="Nature">Nature</option>
        <option value="Luxury">Luxury</option>
        <option value="Adventure">Adventure</option>
        </select>

      <button type="submit" className="bg-indigo-500 p-2 rounded-lg ">Create Package</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
    </div>
  );
}
