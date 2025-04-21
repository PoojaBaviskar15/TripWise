import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [agencyId, setAgencyId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .maybeSingle();

      if (!roleError && userData) {
        setRole(userData.role);

        if (userData.role === "agency") {
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
      setLoading(false);
    };

    // Initial fetch
    fetchUserAndDetails();

    // Auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          await fetchUserAndDetails(); // Refresh role & agencyId on sign-in
        } else {
          setRole(null);
          setAgencyId(null);
        }

        setLoading(false);
      }
    );

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { user: data?.user, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data?.user, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setAgencyId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        role,
        setRole,
        agencyId,
        setAgencyId,
        signUp,
        signIn,
        signOut,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
