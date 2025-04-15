import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { StarIcon } from "@heroicons/react/24/solid";

export default function MyReviewsPage() {
  const [user, setUser] = useState(null);
  const [packageReviews, setPackageReviews] = useState([]);
  const [blogReviews, setBlogReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get current user from Supabase
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchAllReviews = async () => {
      if (!user) return;
      setLoading(true);
    
      // Fetch package reviews
      const { data: packageData, error: packageError } = await supabase
        .from("reviews")
        .select(`
          *,
          tour_packages (
            id,
            title,
            image_urls
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
    
      if (packageError) {
        console.error("Error fetching tour package reviews:", packageError.message);
      } else {
        setPackageReviews(packageData || []);
      }
    
      // Fetch blog reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from('blog_reviews')
        .select(`*, blogs (
          id,
          title
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
    
      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError.message);
        setLoading(false);
        return;
      }
    
      console.log("Blog Reviews Data:", reviews); // Debugging Blog Reviews
    
      // Fetch blog images separately based on blog_id
      const { data: images, error: imagesError } = await supabase
        .from('blog_images')
        .select('blog_id, image_url');
    
      if (imagesError) {
        console.error('Error fetching blog images:', imagesError.message);
        setLoading(false);
        return;
      }
    
      console.log("Blog Images Data:", images); // Debugging Blog Images
    
      // Combine the reviews and images data
      const reviewsWithImages = reviews.map(review => {
        // Find the image for the corresponding blog_id
        const image = images.find(img => img.blog_id === review.blog_id);
        return {
          ...review,
          image_urls: image ? image.image_url : null // Add image_url or null if not found
        };
      });
    
      console.log("Combined Reviews with Images:", reviewsWithImages); // Debugging Combined Data
    
      // Set blog reviews after combining with images
      setBlogReviews(reviewsWithImages || []);
    
      setLoading(false);
    };
    

    fetchAllReviews();
  }, [user]);

  if (loading) return <div className="text-center py-6">Loading reviews...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-red-950 mb-6">My Reviews</h2>

      {packageReviews.length === 0 && blogReviews.length === 0 ? (
        <p className="text-gray-600">You haven’t reviewed any packages or blogs yet.</p>
      ) : (
        <div className="space-y-10">
          {/* Tour Package Reviews */}
          {packageReviews.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-red-800">Tour Package Reviews</h3>
              {packageReviews.map((review) => (
                <div key={`package-${review.id}`} className="p-4 bg-white rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <img
                      src={review.tour_packages?.image_urls?.[0] || "/default-image.jpg"}
                      alt={review.tour_packages?.title}
                      className="w-20 h-20 rounded object-cover cursor-pointer"
                      onClick={() => navigate(`/package/${review.tour_packages?.id}`)}
                    />
                    <div
                      className="cursor-pointer"
                      onClick={() => navigate(`/package/${review.tour_packages?.id}`)}
                    >
                      <h4 className="text-lg font-semibold text-red-950">
                        {review.tour_packages?.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
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

          {/* Blog Reviews */}
          {blogReviews.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-red-800">Blog Reviews</h3>
              {blogReviews.map((review) => (
                <div key={`blog-${review.id}`} className="p-4 bg-white rounded-lg shadow-md">
                  <div className="flex items-center space-x-4">
                    <img
                      src={review.blog_images?.image_urls || "/default-image.jpg"} 
                      alt={review.blogs?.title}
                      className="w-20 h-20 rounded object-cover cursor-pointer"
                      onClick={() => navigate(`/blogs/${review.blogs?.id}`)}
                    />
                    <div
                      className="cursor-pointer"
                      onClick={() => navigate(`/blogs/${review.blogs?.id}`)}
                    >
                      <h4 className="text-lg font-semibold text-red-950">
                        {review.blogs?.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
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
      )}
    </div>
  );
}
