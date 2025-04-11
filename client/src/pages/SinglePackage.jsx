import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabase";

export default function SinglePackage() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tour_packages")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setPkg(data);
      } catch (err) {
        console.error("Error fetching package details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (!pkg) return <p className="text-center text-lg text-red-600">Package not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <img
          src={pkg.image_urls ? pkg.image_urls[0] : "/default-image.jpg"}
          alt={pkg.title}
          className="w-full h-60 object-cover rounded-md"
        />
        <h1 className="text-3xl font-bold text-red-950 mt-4">{pkg.title}</h1>
        <p className="text-gray-600 mt-2">{pkg.location}</p>
        <p className="text-gray-500 mt-2">{pkg.description}</p>
        <p className="text-red-600 font-bold mt-3">₹{pkg.price}</p>
        <p className="text-gray-500">Duration: {pkg.duration} days</p>
        <p className="text-gray-500">Start Date: {pkg.start_date}</p>
        <p className="text-gray-500">End Date: {pkg.end_date}</p>

        <button className="mt-4 bg-red-950 text-white px-4 py-2 rounded-lg w-full">
          Book Now
        </button>
      </div>
    </div>
  );
}
