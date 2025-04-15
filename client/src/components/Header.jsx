import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../components/AuthContext";
import { FaUserCircle } from "react-icons/fa"; // Profile Icon

export default function Header() {
    const { user, role } = useAuth();
    const navigate = useNavigate();

    const handleProfileClick = () => {
        if (role === "admin") {
            navigate("/admin-dashboard");
        } else if (role === "agency") {
            navigate("/agency-dashboard");
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <header className='bg-linear-45 from-[#5D0276] to-[#F6A419] p-3 shadow-md'>
            <div className='flex justify-between items-center max-w-6xl mx-auto'>
                <Link to={'/about'}>
                    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
                        <span className='text-amber-600'>Trip</span>
                        <span className='text-amber-600'>Wise</span>
                    </h1>
                </Link>
                <ul className='flex gap-9 font-semibold text-[#E6D2A4]'>
                    <Link to={'/'}>
                        <li className='hidden sm:inline hover:underline'>Home</li>
                    </Link>
                    <Link to={'/package'}>
                        <li className='hidden sm:inline hover:underline'>Packages</li>
                    </Link>
                    <Link to={'/blogs'}>
                        <li className='hidden sm:inline hover:underline'>Experience</li>
                    </Link>
                </ul>
                {user ? (
                    <button onClick={handleProfileClick} className="flex items-center space-x-2 cursor-pointer">
                        <FaUserCircle size={28} className="text-fuchsia-950" />
                        <span className="text-fuchsia-950 font-bold">Profile</span>
                    </button>
                ) : (
                    <Link to="/sign-in" className="bg-white text-blue-900 px-4 py-2 rounded-lg">
                        Sign In
                    </Link>
                )}
            </div>
        </header>
    );
}
