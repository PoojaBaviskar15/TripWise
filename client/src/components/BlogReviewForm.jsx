import React, { useState } from 'react';
import { Box, Typography, Rating, TextField, Button } from '@mui/material';
import { supabase } from './supabaseClient';

const BlogReviewForm = ({ blog, user, setReviews }) => {
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.rating || !newReview.comment) {
      setError('Please provide a rating and a comment.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Insert the review
      const { data: insertData, error: insertError } = await supabase
        .from('blog_reviews')
        .insert([
          {
            blog_id: blog.id,
            user_id: user.id,
            rating: newReview.rating,
            comment: newReview.comment,
            created_at: new Date(),
          },
        ])
        .select(); // Return inserted row(s)

      if (insertError) throw insertError;

      // Fetch all reviews again with joined username
      const { data: reviewData, error: fetchError } = await supabase
        .from('blog_reviews')
        .select(`
          *,
          user:user_id (
            fullname
          )
        `)
        .eq('blog_id', blog.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReviews(reviewData);
      setSuccessMessage('Your review has been submitted successfully!');
      setNewReview({ rating: 0, comment: '' });
    } catch (err) {
      console.error(err);
      setError('There was an issue submitting your review. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <Typography variant="h6" gutterBottom>
        Leave a Review for this Blog
      </Typography>

      {error && <Typography color="error">{error}</Typography>}
      {successMessage && <Typography color="success.main">{successMessage}</Typography>}

      <form onSubmit={handleSubmit}>
        <Box sx={{ marginBottom: '16px' }}>
          <Typography variant="body1">Rating</Typography>
          <Rating
            value={newReview.rating}
            onChange={(event, newValue) => setNewReview({ ...newReview, rating: newValue })}
            size="large"
            sx={{ marginBottom: '16px' }}
          />
        </Box>

        <TextField
          label="Your Comment"
          multiline
          rows={4}
          fullWidth
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
          variant="outlined"
          sx={{ marginBottom: '16px' }}
        />

        <Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default BlogReviewForm;
