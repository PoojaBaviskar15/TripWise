// import express from 'express';
// import { signIn, signUp, addReview, getReviewsByPackage } from '../controllers/auth.controller';

// const router = express.Router();

// router.get('/signin', signIn);

// router.post("/signup", signUp);

// // Add a review
// router.post("/reviews", addReview);

// // Get reviews by package
// router.get("/reviews/:packageId", getReviewsByPackage);

// export default router;

import express from "express";
import {
  signUp,
  signIn,
  logout,
  getCurrentUser,
  deleteAccount,
  fetchUsers,
  checkAuthSession,
  addReview,
  getReviewsByPackage,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Auth routes
router.post("/signup", signUp);
router.get("/signin", signIn);
router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.delete("/delete", deleteAccount);
router.get("/users", fetchUsers);
router.get("/session", checkAuthSession);

// Review routes
router.post("/reviews", addReview);
router.get("/reviews/:packageId", getReviewsByPackage);

export default router;
