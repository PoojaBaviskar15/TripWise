import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import { Box, Typography, Grid } from "@mui/material";

export default function WishlistPage() {
  const [packages, setPackages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: wishlistData } = await supabase
          .from("wishlist")
          .select("package_id")
          .eq("user_id", user.id);

        const packageIds = wishlistData.map((w) => w.package_id);
        if (packageIds.length) {
          const { data: packageData } = await supabase
            .from("tour_packages")
            .select("*")
            .in("id", packageIds);
          setPackages(packageData);
        }
      }
    };

    fetchWishlist();
  }, []);

  return (
    <Box p={2}>
      <Typography variant="h4">My Wishlist</Typography>
      <Grid container spacing={2}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg.id}>
            <Box p={2} boxShadow={2} borderRadius={2}>
              <img
                src={pkg.image_urls?.[0]}
                alt={pkg.title}
                style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 8 }}
              />
              <Typography variant="h6">{pkg.title}</Typography>
              <Typography>₹{pkg.price}</Typography>
              <Typography>{pkg.duration} days</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
