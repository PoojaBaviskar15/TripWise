import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Box, TextField, Button, Typography, Stack, Chip, MenuItem } from '@mui/material';

const categoryOptions = ['Festivals', 'Heritage', 'Food', 'Architecture', 'Art'];

const CreateBlog = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    place: '',
    category: '',
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch the user and profile data when component mounts
  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        console.error('Error fetching auth user:', authError);
        return;
      }

      const authUser = authData.user;
      setUser(authUser);

      // Fetch the full name of the user from `users` table
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('fullname')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError.message);
        return;
      }

      setForm((prevForm) => ({
        ...prevForm,
        author: profileData?.fullname || 'Anonymous', // Auto-fill author
      }));
    };

    getUserAndProfile();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const uploadImagesToStorage = async (blogId) => {
    const imageUrls = [];
  
    for (const image of images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
  
      try {
        const { data, error } = await supabase.storage
          .from('blog-images') // Ensure this bucket exists in your Supabase dashboard
          .upload(fileName, image);
  
        if (error) {
          console.error('Error uploading image:', error.message);
          continue;  // Skip this image and continue with the next one
        }
  
        const publicUrl = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName).data.publicUrl;
  
        imageUrls.push(publicUrl);
  
        // Save image record in blog_images table
        await supabase.from('blog_images').insert([
          { blog_id: blogId, url: publicUrl }
        ]);
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError.message);
      }
    }
  
    return imageUrls;
  };
  

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.place || !form.category) {
      alert('Please fill all fields');
      return;
    }

    setUploading(true);

    // Insert the blog data
    const { data: blogData, error } = await supabase
      .from('blogs')
      .insert([{ ...form, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error creating blog:', error.message);
      setUploading(false);
      return;
    }

    // Upload images if present
    if (images.length > 0) {
      await uploadImagesToStorage(blogData.id);
    }

    alert('Blog created successfully!');
    setForm({ title: '', content: '', place: '', category: '', author: '' });
    setImages([]);
    setUploading(false);
  };

  return (
    <Box maxWidth={600} mx="auto" mt={4} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" mb={3}>Create Blog</Typography>

      <TextField
        label="Title"
        fullWidth
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Content"
        fullWidth
        multiline
        rows={6}
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Place"
        fullWidth
        value={form.place}
        onChange={(e) => setForm({ ...form, place: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        select
        label="Category"
        fullWidth
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        sx={{ mb: 2 }}
      >
        {categoryOptions.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>

      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Upload Images
        <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
      </Button>

      <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
        {images.map((file, idx) => (
          <Chip
            key={idx}
            label={file.name}
            onDelete={() => setImages(images.filter((_, i) => i !== idx))}
          />
        ))}
      </Stack>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={uploading}
      >
        {uploading ? 'Creating...' : 'Create Blog'}
      </Button>
    </Box>
  );
};

export default CreateBlog;
