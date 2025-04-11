// 
// import {FaSearch } from 'react-icons/fa';

// export default function Home() {
//   return (
//     <div>Home
//         <form className='bg-pink-100 p-3 rounded-lg flex justify-between'>
//             <input type='text' placeholder='Search...' />
//             <FaSearch className='text-pink-800'/>
//         </form>
//     </div>
   
//   )
// }
import React from 'react'
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function Home() {
  const { user, role } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        console.log("🔍 Fetching tour packages...");
        const { data, error } = await supabase
          .from("tour_packages")
          .select("id, title, location, price, duration, category, image_urls")
          .limit(6); // Fetch latest 6 packages

        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error("❌ Error fetching packages:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-purple-600 to-orange-400 text-white p-16 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold">Explore the World with TripWise</h1>
        <p className="mt-2">Find the best travel experiences, customized for you!</p>
      </div>

      {/* Travel Stats */}
      <div className="grid md:grid-cols-3 gap-6 mt-12 text-center">
        <div className="p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-blue-700">500+</h2>
          <p className="text-gray-600">Total Tours</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-green-700">100K+</h2>
          <p className="text-gray-600">Happy Travelers</p>
        </div>
        <div className="p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-red-700">80+</h2>
          <p className="text-gray-600">Countries Covered</p>
        </div>
      </div>

      {/* Package Carousel */}
      <h2 className="text-2xl font-bold text-gray-800 mt-12">Featured Packages</h2>
      <Link to="/package">
        <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
          Explore Packages
        </button>
      </Link>
      {loading ? (
        <p className="text-center text-gray-500 mt-4">Loading packages...</p>
      ) : (
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          navigation
          autoplay={{ delay: 3000 }}
          modules={[Navigation, Autoplay]}
          className="mt-6"
        >
          {packages.map((pkg) => (
            <SwiperSlide key={pkg.id}>
              <div className="bg-white p-4 shadow-lg rounded-lg">
                <h3 className="text-lg font-bold text-blue-900">{pkg.title}</h3>
                <p className="text-gray-600">{pkg.location}</p>
                <p className="text-gray-700 font-semibold">₹{pkg.price}</p>
                <p className="text-sm text-gray-500">{pkg.duration} days</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    {/* 🚀 Dynamic Call to Action */}
  <section className="bg-fuchsia-900 text-white py-12 text-center">
<h2 className="text-3xl font-bold">Start Your Adventure Today!</h2>
    <p className="mt-2">Explore the best cultural destinations with TripWise.</p>

       {/* Dynamic Buttons Based on Role */}
       {!user ? (
          <Link to="/sign-up">
            <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
              Sign Up Now
            </button>
          </Link>
        ) : role === "agency" ? (
          <Link to="/agency-dashboard">
            <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
              Create a Tour Package
            </button>
          </Link>
        ) : (
          <Link to="/package">
            <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
              Explore Packages
            </button>
          </Link>
        )}
      </section>
    </div>
  );
}


// import { Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import { useAuth } from "../components/AuthContext"; // ✅ Import Auth Context

// export default function Home() {
//   const { user, role } = useAuth(); // ✅ Get user & role from auth
//   const [featuredPackages, setFeaturedPackages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPackages = async () => {
//       try {
//         const { data, error } = await supabase
//           .from("tour_packages")
//           .select("id, title, location, price, duration, category, image_urls")
//           .limit(3);

//         if (error) throw error;
//         setFeaturedPackages(data || []);
//       } catch (err) {
//         console.error("❌ Error fetching featured packages:", err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPackages();
//   }, []);

//   return (
//     <div className="bg-gray-100">
//       {/* 🌍 Hero Section */}
//       <div className="relative bg-cover bg-center h-[500px] flex flex-col justify-center items-center text-center text-white"
//         style={{ backgroundImage: "url('/src/assets/images/heritage-bg.jpg')" }}>
//         <h1 className="text-5xl font-bold drop-shadow-lg">Discover Heritage & Culture</h1>
//         <p className="mt-3 text-lg">Explore the most amazing cultural destinations</p>
//         <Link to="/package">
//           <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
//             Explore Packages
//           </button>
//         </Link>
//       </div>

//       {/* 🌟 Featured Packages */}
//       <section className="max-w-6xl mx-auto py-12 px-4">
//         <h2 className="text-3xl font-bold text-center text-fuchsia-900">Featured Packages</h2>
//         {loading ? (
//           <p className="text-center mt-5">Loading packages...</p>
//         ) : (
//           <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 mt-6">
//             {featuredPackages.map((pkg) => (
//               <div key={pkg.id} className="p-4 bg-white border shadow-md rounded-lg">
//                 <img src={pkg.image_urls?.[0]} alt={pkg.title} className="h-40 w-full object-cover rounded-lg" />
//                 <h3 className="font-bold text-xl text-fuchsia-800 mt-3">{pkg.title}</h3>
//                 <p><strong>Location:</strong> {pkg.location}</p>
//                 <p><strong>Price:</strong> ₹{pkg.price}</p>
//                 <p><strong>Duration:</strong> {pkg.duration} days</p>
//                 <Link to={`/package/${pkg.id}`} className="text-blue-500 font-bold mt-2 inline-block">
//                   View Details →
//                 </Link>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* 🚀 Dynamic Call to Action */}
//       <section className="bg-fuchsia-900 text-white py-12 text-center">
//         <h2 className="text-3xl font-bold">Start Your Adventure Today!</h2>
//         <p className="mt-2">Explore the best cultural destinations with TripWise.</p>

//         {/* Dynamic Buttons Based on Role */}
//         {!user ? (
//           <Link to="/sign-up">
//             <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
//               Sign Up Now
//             </button>
//           </Link>
//         ) : role === "agency" ? (
//           <Link to="/agency-dashboard">
//             <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
//               Create a Tour Package
//             </button>
//           </Link>
//         ) : (
//           <Link to="/package">
//             <button className="mt-5 px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700">
//               Explore Packages
//             </button>
//           </Link>
//         )}
//       </section>
//     </div>
//   );
// }
