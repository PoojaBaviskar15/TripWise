import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./components/AuthContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Package from "./pages/Package";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import AgencyDashboard from "./pages/AgencyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import PendingApproval from "./pages/PendingApproval";
import TourPackages from "./pages/Package";
import SinglePackage from "./pages/SinglePackage";
import EditProfile from "./components/EditProfile";
import WishlistPage from "./pages/WishList";

function AppRoutes() {
  const { user, role,  loading  } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // ✅ Show loading screen while auth is being checked
  }
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/about" element={<About />} />
      <Route path="/package" element={<Package />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/packages" element={<TourPackages />} />
      <Route path="/package/:id" element={<SinglePackage />} />

      {/* 🔹 Role-Based Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user", "admin", "agency"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/agency-dashboard" element={<ProtectedRoute allowedRoles={["agency", "admin"]}><AgencyDashboard /></ProtectedRoute>} />
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard/></ProtectedRoute>} />
      <Route 
        path="/edit-profile" 
        element={<ProtectedRoute allowedRoles={["user", "agency", "admin"]}><EditProfile /></ProtectedRoute>} 
      />
      <Route 
        path="/wishlist" 
        element={<ProtectedRoute allowedRoles={["user", "agency"]}><WishlistPage /></ProtectedRoute>} 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
