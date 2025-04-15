// src/services/blogService.js
import { supabase } from '../lib/supabaseClient';

export async function createBlogWithImages(blogData, files) {
  // Insert blog
  const { data: blog, error } = await supabase
    .from('blogs')
    .insert([blogData])
    .select()
    .single();

  if (error) throw error;

  // Upload images
  const uploadedUrls = await Promise.all(files.map(async (file) => {
    const filePath = `${blog.id}/${file.name}`;
    const { error } = await supabase.storage
      .from('blog-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }));

  // Insert image URLs into blog_images table
  const imageInsert = uploadedUrls.map((url) => ({
    blog_id: blog.id,
    image_url: url,
  }));

  const { error: imgError } = await supabase
    .from('blog_images')
    .insert(imageInsert);

  if (imgError) throw imgError;

  return blog;
}
