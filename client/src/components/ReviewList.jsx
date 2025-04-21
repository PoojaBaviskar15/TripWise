// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, Typography, Rating, Divider } from '@mui/material';
// import { supabase } from "../../supabase";

// const ReviewList = ({ blogId }) => {
//   const [reviews, setReviews] = useState([]);

//   useEffect(() => {
//     const fetchReviews = async () => {
//       const { data, error } = await supabase
//         .from('reviews')
//         .select('id, user_id, rating, comment')
//         .eq('blog_id', blogId); // Replace with your actual column name for blog_id

//       if (error) {
//         console.error('Error fetching reviews:', error);
//       } else {
//         setReviews(data);
//       }
//     };

//     fetchReviews();
//   }, [blogId]);

//   return (
//     <div>
//       {reviews.map((review) => (
//         <Card key={review.id} sx={{ marginBottom: 2 }}>
//           <CardContent>
//             <Typography variant="body1">User ID: {review.user_id}</Typography>
//             <Rating value={review.rating} readOnly />
//             <Typography variant="body2">{review.comment}</Typography>
//           </CardContent>
//         </Card>
//       ))}
//       {reviews.length === 0 && <Typography>No reviews yet!</Typography>}
//     </div>
//   );
// };

// export default ReviewList;
