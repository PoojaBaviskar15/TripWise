import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { StarIcon } from "@heroicons/react/24/solid";

export default function MyReviewsPage() {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReviews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          tour_packages (
            id,
            title,
            image_urls
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user reviews:", error.message);
      } else {
        setReviews(data || []);
      }

      setLoading(false);
    };

    if (userId) fetchUserReviews();
  }, [userId]);

  if (loading) return <div className="text-center py-6">Loading reviews...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-red-950 mb-6">My Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-600">You haven’t reviewed any packages yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 bg-white rounded-lg shadow-md">
              <div className="flex items-center space-x-4">
                <img
                  src={review.tour_packages?.image_urls?.[0] || "/default-image.jpg"}
                  alt={review.tour_packages?.title}
                  className="w-20 h-20 rounded object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-red-950">
                    {review.tour_packages?.title}
                  </h3>
                  <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-2 text-gray-700">{review.comment}</div>
              <div className="flex items-center mt-1 text-yellow-600">
                Rating: {review.rating}
                <StarIcon className="h-5 w-5 ml-1 text-yellow-500" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
