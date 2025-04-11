import { supabase } from "../../client/supabase"; // Ensure the correct path

// 🔹 Signup Function (User, Agency, Admin)
export const signUp = async (email, password, role, additionalData) => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error("Signup Error:", error);
    throw error;
  }

  if (!data.user) throw new Error("Signup failed. Please try again.");

  const userId = data.user.id;
  console.log("✅ User created with ID:", userId);

  // ✅ Ensure Authenticated User Can Insert Data
  const { error: userError } = await supabase.from("users").insert([
    { id: userId, email, fullname: additionalData.fullname, role }
  ]);
  if (userError) {
    console.error("❌ User Table Insert Error:", userError);
    throw userError;
  }

  // Insert into agencies or admins table if applicable
  if (role === "agency") {
    const { error: agencyError } = await supabase.from("agencies").insert([
      { user_id: userId,
        agency_name: additionalData.agency_name,
        contact_number: additionalData.contact_number,
        website: additionalData.website,
        description: additionalData.description || "N/A",
        status: "pending", // ✅ Ensure status is set to "pending"
        created_at: new Date().toISOString()}
    ]);
    if (agencyError) {
      console.error("Agency Table Insert Error:", agencyError);
      throw agencyError;
    }
    console.log("✅ Agency registration successful!");
  } else if (role === "admin") {
    if (additionalData.admin_code !== "SECRET123") {
      throw new Error("Invalid admin code.");
    }
    const { error: adminError } = await supabase.from("admins").insert([
      { user_id: userId, admin_code: additionalData.admin_code, email }
    ]);
    if (adminError) {
      console.error("Admin Table Insert Error:", adminError);
      throw adminError;
    }
    console.log("✅ Admin registration successful!");
  }

  return data;
};




// 🔹 Sign In Function
export const signIn = async (email, password) => {
  try {
    await supabase.auth.signOut(); // ✅ Ensure fresh login session

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;
    if (!data.session) throw new Error("Invalid sign-in credentials.");

    // ✅ Fetch user role from 'users' table
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id) // Match the ID, not email
      .maybeSingle();

      if (userData.role === "agency") {
        const { data: agencyData, error: agencyError } = await supabase
          .from("agencies")
          .select("status")
          .eq("user_id", data.user.id)
          .single();
    
        if (agencyError) throw agencyError;
        
        if (agencyData.status !== "approved") {
          throw new Error("Your agency account is pending approval by an admin.");
        }
      }

    if (roleError) throw roleError;

    return { ...data, role: userData?.role || "user" }; // Default to 'user' if role not found
  } catch (err) {
    console.error("Sign-in error:", err.message);
    throw err;
  }
};




// 🔹 Logout Function
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};




// 🔹 Get Current User
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};




// 🔹 Delete User Account
export const deleteAccount = async () => {
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not found.");
  }

  const userId = user.id;

  // Delete user data from custom tables
  const { error: deleteDataError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

    await supabase.from("users").delete().eq("id", userId);
    await supabase.from("agencies").delete().eq("user_id", userId);
    await supabase.from("admins").delete().eq("user_id", userId);

  if (deleteDataError) throw deleteDataError;

  // Delete user from Supabase Auth (Requires admin privileges)
  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteAuthError) throw deleteAuthError;

  return { success: true };
};




export async function fetchUsers() {
  try {
    const { data, error } = await supabase.from("users").select("*");

    if (error) throw new Error(error.message);

    return data;
  } catch (err) {
    console.error("Error fetching users:", err);
    return []; // Prevents syntax errors in Vite
  }
}

export async function checkAuthSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }

  return data?.session;
}