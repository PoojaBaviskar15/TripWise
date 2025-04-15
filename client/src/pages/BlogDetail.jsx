import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Box, Typography, Rating, TextField, Button, Grid, Card, CardContent } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const BlogDetails = () => {
  const { id: blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [user, setUser] = useState(null);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', blogId)
        .single();
      if (!error) setBlog(data);
    };
    fetchBlog();
  }, [blogId]);

  // Fetch blog reviews
  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('blog_reviews')
        .select('*, user:user_id(fullname)')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: false });

      if (!error) setReviews(data);
    };
    fetchReviews();
  }, [blogId]);

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  // Submit review
  const handleSubmit = async () => {
    if (!user) return alert("Please login to submit a review.");
    if (newReview.rating === 0 || newReview.comment.trim() === '') return;

    const { data, error } = await supabase.from('blog_reviews').insert([{
      blog_id: blogId,
      user_id: user.id,
      rating: newReview.rating,
      comment: newReview.comment
    }]);

    if (!error && data) {
      setReviews(prev => [data[0], ...prev]);
      setNewReview({ rating: 0, comment: '' });
    }
  };

  if (!blog) return <p>Loading...</p>;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>{blog.title}</Typography>
      <Typography variant="subtitle2">
        By {blog.author || 'Unknown'} | {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'No Date'}
      </Typography>
      {blog.image && (
        <Box my={2}>
          <img src={blog.image} alt="Blog" width="100%" style={{ maxHeight: 400, objectFit: 'cover' }} />
        </Box>
      )}
      <Typography variant="body1" mb={4}>{blog.content}</Typography>

      <Typography variant="h6">Average Rating</Typography>
      <Rating value={avgRating} precision={0.5} readOnly />
      <Typography mb={3}>{reviews.length} review(s)</Typography>

      <Box mb={4}>
        <Typography variant="h6">Leave a Review</Typography>
        <Rating
          name="rating"
          value={newReview.rating}
          onChange={(e, value) => setNewReview({ ...newReview, rating: value })}
        />
        <TextField
          label="Comment"
          fullWidth
          multiline
          rows={3}
          sx={{ mt: 2 }}
          value={newReview.comment}
          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
        />
        <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>
          Submit Review
        </Button>
      </Box>

      <Typography variant="h6">Reviews</Typography>
      {/* {reviews.length > 0 ? (
        reviews.map((review) => (
          <Box key={review.id} mb={2} p={2} border="1px solid #ccc" borderRadius="10px">
            <Typography variant="subtitle2">{review.user?.username || 'Anonymous'}</Typography>
            <Rating value={review.rating} readOnly />
            <Typography variant="body2">{review.comment}</Typography>
          </Box>
        ))
      ) : (
        <Typography>No reviews yet.</Typography>
      )} */}
      {reviews.length === 0 ? (
        <Typography>No reviews yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {reviews.map((review) => (
            <Grid key={review.id} columns={12} style={{ gridColumn: 'span 12' }}>
              <Card elevation={2}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.user?.fullname || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(review.created_at).format('MMM D, YYYY [at] h:mm A')}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {review.comment}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default BlogDetails;
