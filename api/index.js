import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import userRouter from './routes/user.route.js';
import { addReview, getReviewsByPackage } from './controllers/auth.controller.js'; // adjust path if needed

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ User Routes
app.use('/auth/vi', userRouter);

// ✅ Review Routes
app.post('/api/reviews', addReview);
app.get('/api/reviews/:package_id', getReviewsByPackage);

// ✅ Default Route
app.get('/', (req, res) => {
  res.send('TripWise API is running 🚀');
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}!`);
});
