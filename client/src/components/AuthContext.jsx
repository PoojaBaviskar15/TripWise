import React from "react";
import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../../supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [agencyId, setAgencyId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
  
      setUser(user);
  
      // ✅ Fetch Role and Agency ID from Supabase
      const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .maybeSingle();
  
      if (!roleError && userData) {
        setRole(userData.role);
  
        // ✅ Fetch Agency ID if Role is "agency"
        if (userData?.role === "agency") {
          const { data: agencyData, error: agencyError } = await supabase
            .from("agencies")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();
  
          if (!agencyError && agencyData) {
            console.log("✅ Agency ID Found:", agencyData.id);
            setAgencyId(agencyData.id);
          } else {
            console.warn("❌ Failed to fetch agency ID.");
          }
        }
      }
    };
  
    fetchUser();
  }, []);
  

  return (
    <AuthContext.Provider value={{ user, setUser, role, setRole, agencyId, setAgencyId  }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
