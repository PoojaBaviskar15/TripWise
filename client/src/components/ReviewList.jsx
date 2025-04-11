import { useEffect, useState } from "react";
import { Box, Typography, Rating, Divider } from "@mui/material";
import axios from "axios"; // ✅ Use axios instead of supabase

const ReviewList = ({ packageId }) => {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`/api/auth/reviews/${packageId}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err.message);
      setReviews([]);
    }
  };

  useEffect(() => {
    if (packageId) {
      fetchReviews();
    }
  }, [packageId]);

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>User Reviews</Typography>
      {Array.isArray(reviews) && reviews.length === 0 ? (
        <Typography>No reviews yet.</Typography>
      ) : (
        reviews.map((review) => (
          <Box key={review.id} mb={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              {review.user?.username || "Anonymous"}
            </Typography>
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="body2">{review.comment}</Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default ReviewList;
