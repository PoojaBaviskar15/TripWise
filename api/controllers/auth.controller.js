import { supabase } from "../../client/supabase.js"; // Make sure this path is correct

// 🔹 Signup Function (User, Agency, Admin)
export const signUp = async (email, password, role, additionalData) => {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkUserError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (checkUserError) {
      console.error("Error checking user existence:", checkUserError);
      throw checkUserError;
    }

    if (existingUser) {
      throw new Error("User already exists with this email.");
    }

    // Sign up the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error("Signup Error:", error);
      throw error;
    }

    if (!data.user) throw new Error("Signup failed. Please try again.");

    const userId = data.user.id;
    console.log("✅ User created with ID:", userId);

    // Insert user data into the 'users' table
    const { error: userError } = await supabase.from("users").insert([{
      id: userId,
      email,
      fullname: additionalData.fullname,
      role,
    }]);

    if (userError) {
      console.error("❌ User Table Insert Error:", userError);
      throw userError;
    }

    if (role === "agency") {
      // Insert agency details if role is 'agency'
      const { error: agencyError } = await supabase.from("agencies").insert([{
        user_id: userId,
        agency_name: additionalData.agency_name,
        contact_number: additionalData.contact_number,
        website: additionalData.website,
        description: additionalData.description || "N/A",
        status: "pending",
        created_at: new Date().toISOString(),
      }]);

      if (agencyError) {
        console.error("Agency Table Insert Error:", agencyError);
        throw agencyError;
      }

      console.log("✅ Agency registration successful!");
    } else if (role === "admin") {
      // Insert admin details if role is 'admin'
      if (additionalData.admin_code !== "SECRET123") {
        throw new Error("Invalid admin code.");
      }

      const { error: adminError } = await supabase.from("admins").insert([{
        user_id: userId,
        admin_code: additionalData.admin_code,
        email,
      }]);

      if (adminError) {
        console.error("Admin Table Insert Error:", adminError);
        throw adminError;
      }

      console.log("✅ Admin registration successful!");
    }

    return data;
  } catch (error) {
    console.error("Error during sign up:", error.message);
    throw error;
  }
};

// 🔹 Sign In Function
export const signIn = async (email, password) => {
  try {
    // Sign out previous session
    await supabase.auth.signOut();

    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign-in Error:", error);
      throw error;
    }

    if (!data.session) throw new Error("Invalid sign-in credentials.");

    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
      throw roleError;
    }

    if (userData.role === "agency") {
      // Check if the agency is approved
      const { data: agencyData, error: agencyError } = await supabase
        .from("agencies")
        .select("status")
        .eq("user_id", data.user.id)
        .single();

      if (agencyError) {
        console.error("Error fetching agency status:", agencyError);
        throw agencyError;
      }

      if (agencyData.status !== "approved") {
        throw new Error("Your agency account is pending approval by an admin.");
      }
    }

    return { ...data, role: userData?.role || "user" };
  } catch (error) {
    console.error("Sign-in error:", error.message);
    throw error;
  }
};

// 🔹 Logout Function
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Logout Error:", error);
    throw error;
  }
};

// 🔹 Get Current User
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

// 🔹 Delete User Account
export const deleteAccount = async () => {
  try {
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not found.");

    const userId = user.id;

    await supabase.from("users").delete().eq("id", userId);
    await supabase.from("agencies").delete().eq("user_id", userId);
    await supabase.from("admins").delete().eq("user_id", userId);

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteAuthError) throw deleteAuthError;

    return { success: true };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

// 🔹 Fetch All Users
export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// 🔹 Check Auth Session
export const checkAuthSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
      return null;
    }
    return data?.session;
  } catch (error) {
    console.error("Error checking auth session:", error);
    return null;
  }
};

// 🔹 Add a new review
export const addReview = async (req, res) => {
  try {
    const { package_id, user_id, rating, comment } = req.body;

    if (!package_id || !user_id || !rating || !comment) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const { data, error } = await supabase.from("reviews").insert([{
      package_id,
      user_id,
      rating,
      comment,
    }]);

    if (error) throw error;

    return res.status(201).json({ message: "Review added successfully", data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all reviews for a package
export const getReviewsByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    const { data, error } = await supabase
      .from("reviews")
      .select("*, user:user_id(email)")
      .eq("package_id", packageId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 🔹 Add a new blog
export const addBlog = async (req, res) => {
  try {
    const { title, content, image_url, category, place, user_id } = req.body;

    if (!title || !content || !user_id) {
      return res.status(400).json({ error: "Title, content, and user ID are required." });
    }

    const { data, error } = await supabase.from("blogs").insert([{
      title,
      content,
      image_url,
      category,
      place,
      user_id,
      created_at: new Date().toISOString(),
    }]);

    if (error) throw error;

    res.status(201).json({ message: "Blog posted successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Get all blogs (optionally filtered by category or place)
export const getBlogs = async (req, res) => {
  try {
    const { category, place } = req.query;

    let query = supabase
      .from("blogs")
      .select("*, user:user_id(fullname, email)")  // ✅ Corrected join fields
      .order("created_at", { ascending: false });

    if (category) query = query.eq("category", category);
    if (place) query = query.eq("place", place);

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Get a specific blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("blogs")
      .select("*, user:user_id(fullname, email)")  // ✅ Corrected join fields
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
