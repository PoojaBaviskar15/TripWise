import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Box, Typography, Grid, CircularProgress } from "@mui/material";

export default function WishlistPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);

      // Step 1: Get the logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User fetch error:", userError?.message || "No user");
        setLoading(false);
        return;
      }

      // Step 2: Fetch wishlist items for this user
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlist")
        .select("package_id")
        .eq("user_id", user.id);

      if (wishlistError) {
        console.error("Wishlist fetch error:", wishlistError.message);
        setLoading(false);
        return;
      }

      const packageIds = wishlistData.map((w) => w.package_id);

      // Step 3: Fetch packages based on the wishlist package IDs
      if (packageIds.length === 0) {
        setPackages([]);
        setLoading(false);
        return;
      }

      const { data: packageData, error: packageError } = await supabase
        .from("tour_packages")
        .select("*")
        .in("id", packageIds);

      if (packageError) {
        console.error("Package fetch error:", packageError.message);
        setLoading(false);
        return;
      }

      setPackages(packageData);
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        My Wishlist
      </Typography>
      <Grid container spacing={2} columns={12}>
        {packages.length === 0 ? (
          <Typography>No packages in your wishlist.</Typography>
        ) : (
          packages.map((pkg) => (
            <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 4' }} key={pkg.id}>
              <Box p={2} boxShadow={2} borderRadius={2}>
                <img
                  src={pkg.image_urls?.[0]}
                  alt={pkg.title}
                  style={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <Typography variant="h6">{pkg.title}</Typography>
                <Typography>₹{pkg.price}</Typography>
                <Typography>{pkg.duration} days</Typography>
              </Box>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
