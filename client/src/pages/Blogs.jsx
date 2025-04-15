import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Grid, Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import BlogFilters from '../components/BlogFilters';
import { supabase } from '../../supabase';

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ category: '', place: '', search: '' });
  const [error, setError] = useState(null);

  const observer = useRef();

  const uniqueBlogs = Array.from(new Map(blogs.map(blog => [blog.id, blog])).values());

  const lastBlogRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchImages = useCallback(async () => {
        const { data, error } = await supabase.from('blog_images').select('*');
        if (error) {
          console.error('Failed to fetch blog images:', error.message);
          return [];
        }
        return data;
      }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.ilike('category', `%${filters.category}%`);
      }

      if (filters.place) {
        query = query.ilike('place', `%${filters.place}%`);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }

      query = query.range((page - 1) * 10, page * 10 - 1);

      const { data: blogData, error: blogError } = await query;
      if (blogError) throw blogError;

      const fetchedImages = images.length ? images : await fetchImages();
      if (!images.length) setImages(fetchedImages);

      const enrichedBlogs = blogData.map((blog) => ({
        ...blog,
        images: fetchedImages
          .filter((img) => img.blog_id === blog.id)
          .map((img) => img.image_url),
      }));

      // const fetchedBlogs = Array.isArray(data) ? data : [];

      setBlogs((prev) => [...prev, ...enrichedBlogs]);
      setHasMore(enrichedBlogs.length > 0);
    } catch (err) {
      console.error('Failed to fetch blogs:', err.message);
      setError('Error fetching blogs');
      setHasMore(false);
    }
    setLoading(false);
  }, [page, filters, fetchImages, images]);

  useEffect(() => {
    fetchBlogs();
  }, [page, fetchBlogs]);

  useEffect(() => {
    setBlogs([]);
    setPage(1);
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleCreateClick = () => {
    navigate('/create-blog');
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Explore Blogs
        </Typography>
        <Button variant="contained" onClick={handleCreateClick}>
          Create Blog
        </Button>
      </Box>

      <BlogFilters onChange={handleFilterChange} />

      <Grid container columns={{ xs: 4, sm: 8, md: 12 }} columnSpacing={2}>
        {uniqueBlogs.length > 0 ? (
          uniqueBlogs.map((blog, index) => {
            const isLast = index === uniqueBlogs.length - 1;
            return (
              <Grid sx={{ gridColumn: 'span 4' }} key={blog.id}>
                <div ref={isLast ? lastBlogRef : null}>
                  <BlogCard blog={blog} />
                </div>
              </Grid>
            );
          })
        ) : (
          <Typography>No blogs available</Typography>
        )}
      </Grid>

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && <Typography style={{ color: 'red' }}>{error}</Typography>}
    </Box>
  );
};

export default Blogs;
