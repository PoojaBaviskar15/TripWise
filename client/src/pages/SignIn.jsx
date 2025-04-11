import { useState, useEffect } from "react";
import { checkAuthSession, signIn } from "../../../api/controllers/auth.controller"; // Import the signIn function
import { Link, useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../firebaseConfig"; 
import { supabase } from "../../supabase";
import { useAuth } from "../components/AuthContext";


export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setRole} = useAuth();

  useEffect(() => {
    async function checkAndRedirect() {
      const session = await checkAuthSession(); // Check if user is already logged in
  
      if (session) {
        console.log("User already signed in:", session.user);
        
        // ✅ Fetch user role from database
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
  
        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
  
        console.log("User role:", userData?.role); // Debugging role output
  
        // 🔹 Redirect based on role
        if (userData?.role === "admin") {
          navigate("/admin-dashboard");
        } else if (userData?.role === "agency") {
          navigate("/agency-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    }
  
    checkAndRedirect();
  }, []);
  

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user, role } = await signIn(email, password);
      
      setUser(user); 
      setRole(role); 

      // 🔹 Redirect based on role
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "agency") {
        navigate("/agency-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
  }
};

  // const handleGoogleLogin = async () => {
  //   setError(null);
  //   setLoading(true);
  //   try {
  //     const { role } = await signInWithGoogle();
  //     console.log("Google Login Successful, Role:", role);
  
  //     // 🔹 Redirect based on user role
  //     if (role === "admin") {
  //       navigate("/admin-dashboard");
  //     } else if (role === "agency") {
  //       navigate("/agency-dashboard");
  //     } else {
  //       navigate("/dashboard");
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200"
      style={{ backgroundImage: "url('./src/assets/images/trip.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>

      <div className="p-6 w-full max-w-xl mx-auto shadow-lg backdrop-blur-sm rounded-lg"
        style={{ backgroundColor: "rgba(181, 120, 88, 0.3)" }}>

        <div className='text-2xl text-red-950 text-center font-bold my-7'>
          Welcome to TripWise!
        </div>

        <h2 className="text-red-950 text-center font-bold my-7">Sign In</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSignIn} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required className="border p-3 rounded-lg bg-orange-100 text-red-950" />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required className="border p-3 rounded-lg bg-orange-100 text-red-950" />

          <button type="submit" disabled={loading} className='bg-red-950 text-white font-semibold p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {/* <button type="button" onClick= {handleGoogleLogin} disabled={loading} 
          className='bg-violet-900 text-white font-semibold p-3 rounded-lg uppercase hover:opacity-90'>
            {loading ? "Signing In..." : "Sign In with Google"}
          </button> */}

          <div className='flex gap-2 mt-3 text-lg justify-center text-white'>
            <p>Dont have an account?</p>
            <Link to={'/sign-up'}>
              <span className="text-blue-400 font-bold">Sign Up</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
