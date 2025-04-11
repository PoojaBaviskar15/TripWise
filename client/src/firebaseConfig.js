// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { supabase } from "../supabase";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrkSTqw_W7-cH-OlzMaMDPBcQcsNsOsRc",
  authDomain: "tripwise-7055d.firebaseapp.com",
  projectId: "tripwise-7055d",
  storageBucket: "tripwise-7055d.firebasestorage.app",
  messagingSenderId: "7715972530",
  appId: "1:7715972530:web:1554ec7fd514c6d8f530ab"
};


// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔹 Google Sign-In Function
export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
  
      // 🔹 Check if user exists in Supabase
      const { data: existingUser, error } = await supabase
        .from("users")
        .select("role")
        .eq("email", firebaseUser.email)
        .single();
  
      if (!existingUser) {
        // 🔹 Insert new user into Supabase
        await supabase.from("users").insert([
          {
            id: firebaseUser.uid, 
            email: firebaseUser.email,
            fullname: firebaseUser.displayName || "",
            role: "user", // Default role
          }
        ]);
      }
  
      // 🔹 Return user info
      return { email: firebaseUser.email, role: existingUser?.role || "user" };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  export { auth, provider };
  