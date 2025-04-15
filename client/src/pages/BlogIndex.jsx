import { useEffect, useState } from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Grid, Button, CircularProgress, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/blogs'); // Adjust the API endpoint as needed
      setBlogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Explore Blogs
      </Typography>

      <Grid container spacing={4}>
        {blogs.map((blog) => (
          <Grid item xs={12} sm={6} md={4} key={blog.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {blog.image && (
                <CardMedia
                  component="img"
                  height="180"
                  image={blog.image}
                  alt={blog.title}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                  {blog.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap>
                  {blog.content.slice(0, 100)}...
                </Typography>

                <Typography variant="caption" color="text.secondary" mt={2} display="block">
                  By {blog.author} | {new Date(blog.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>

              <Box px={2} pb={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate(`/blogs/${blog.id}`)}
                >
                  Read More
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BlogList;
