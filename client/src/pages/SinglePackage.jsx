import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { HeartIcon as OutlineHeart } from "@heroicons/react/24/outline";
import ReviewForm from "../components/ReviewForm";
import { StarIcon } from "@heroicons/react/24/solid";
import { Box } from "@mui/material";
import ErrorBoundary from "../components/ErrorBoundary";
import TabsComponent from "../components/TabsComponent";

export default function SinglePackage() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userId, setUserId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("tour_packages")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setPkg(data);
      } catch (err) {
        console.error("Error fetching package details:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          user:user_id( email )
        `)
        .eq("package_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error.message);
      } else {
        setReviews(data || []);
      }
    };

    fetchPackage();
    fetchReviews();
  }, [id]);

  useEffect(() => {
    const checkIfFavorite = async () => {
      if (!userId || !id) return;
      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", userId)
        .eq("package_id", id)
        .single();
      if (data) setIsFavorite(true);
    };
    checkIfFavorite();
  }, [userId, id]);

  const toggleFavorite = async () => {
    if (!userId || !id) return;
    if (isFavorite) {
      await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", userId)
        .eq("package_id", id);
      setIsFavorite(false);
    } else {
      await supabase.from("wishlist").insert([
        {
          user_id: userId,
          package_id: id,
        },
      ]);
      setIsFavorite(true);
    }
  };

  const submitReview = async () => {
    if (!userId || newRating === 0 || newComment.trim() === "") return;
    setSubmitting(true);
    await supabase.from("reviews").insert({
      package_id: id,
      user_id: userId,
      rating: newRating,
      comment: newComment,
    });
    setNewRating(0);
    setNewComment("");
    const { data } = await supabase
      .from("reviews")
      .select(`
        *,
        user:user_id ( email )
      `)
      .eq("package_id", id)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setSubmitting(false);
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (!pkg) return <p className="text-center text-lg text-red-600">Package not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="relative">
          <img
            src={pkg.image_urls?.[0] || "/default-image.jpg"}
            alt={pkg.title}
            className="w-full h-60 object-cover rounded-md"
          />
          <button
            className="absolute top-3 right-3 p-2 rounded-full bg-white shadow-md"
            onClick={toggleFavorite}
            aria-label="Toggle Favorite"
          >
            {isFavorite ? (
              <SolidHeart className="h-6 w-6 text-red-600" />
            ) : (
              <OutlineHeart className="h-6 w-6 text-red-600" />
            )}
          </button>
        </div>

        <h1 className="text-3xl font-bold text-red-950 mt-4">{pkg.title}</h1>
        <p className="text-gray-600 mt-2">{pkg.location}</p>
        <p className="text-gray-500 mt-2">{pkg.description}</p>
        <p className="text-red-600 font-bold mt-3">₹{pkg.price}</p>
        <p className="text-gray-500">Duration: {pkg.duration} days</p>
        <p className="text-gray-500">Start Date: {pkg.start_date}</p>
        <p className="text-gray-500">End Date: {pkg.end_date}</p>

        <div className="mt-4">
          <p className="font-semibold text-lg">
            Average Rating: {averageRating}{" "}
            <StarIcon className="h-5 w-5 inline text-yellow-500" />
          </p>
        </div>

        <button className="mt-4 bg-red-950 text-white px-4 py-2 rounded-lg w-full">
          Book Now
        </button>

        {reviews.map((review) => (
          <div key={review.id} className="mt-4 bg-gray-50 p-4 rounded">
            <p className="font-semibold text-sm text-red-950">
              {review.user?.email || "Anonymous"}
            </p>
            <p className="text-gray-700">{review.comment}</p>
            <p className="text-sm text-yellow-600 flex items-center">
              Rating: {review.rating}{" "}
              <StarIcon className="h-4 w-4 ml-1 text-yellow-500" />
            </p>
          </div>
        ))}

        <ErrorBoundary>
          <Box className="mt-6">
            <ReviewForm
              packageId={id}
              userId={userId}
              onSuccess={submitReview}
              rating={newRating}
              setRating={setNewRating}
              comment={newComment}
              setComment={setNewComment}
              submitting={submitting}
            />
          </Box>
        </ErrorBoundary>
      </div>
    </div>
  );
}
