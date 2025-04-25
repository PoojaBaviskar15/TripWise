import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './routes/user.route.js'; // assuming this is same as auth.route.js
import {
  addReview,
  getReviewsByPackage,
  addBlog,
  getBlogs,
  getBlogById,
} from './controllers/auth.controller.js'; // ✅ add blog controllers

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Auth & User Routes
app.use('/auth/vi', userRouter);

// ✅ Review Routes
app.post('/api/reviews', addReview);
app.get('/api/reviews/:package_id', getReviewsByPackage);

// ✅ Blog Routes
app.post('/api/blogs', addBlog);
app.get('/api/blogs', getBlogs);
app.get('/api/blogs/:blogId', getBlogById);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/data', express.static('src/data'));


// ✅ Default Route
app.get('/', (req, res) => {
  res.send('TripWise API is running 🚀');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}!`);
});
