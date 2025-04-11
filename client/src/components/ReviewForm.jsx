import { useState } from "react";
import { Box, Button, TextField, Typography, Rating } from "@mui/material";
import axios from "axios";
import { supabase } from "../../supabase";

const ReviewForm = ({ packageId, userId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) return alert("Please provide both rating and comment");
  
    setLoading(true);
    try {
      const { error } = await supabase.from("reviews").insert([
        {
          package_id: packageId,
          user_id: userId,
          rating,
          comment,
        },
      ]);
  
      if (error) {
        console.error("Review submission failed:", error.message);
        alert("Failed to submit review");
      } else {
        setRating(0);
        setComment("");
        onSuccess(); // Refresh review list
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Box component="form" onSubmit={handleSubmit} p={2}>
      <Typography variant="h6">Leave a Review</Typography>
      <Rating
        value={rating}
        onChange={(e, newVal) => setRating(newVal)}
        sx={{ mt: 1 }}
      />
      <TextField
        label="Your comment"
        multiline
        fullWidth
        rows={4}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mt: 2 }}
      />
      <Button
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </Box>
  );
};

export default ReviewForm;
