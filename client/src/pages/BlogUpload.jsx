import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function BlogUpload() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store metadata in Supabase database
      const { error: dbError } = await supabase
        .from('blogs')
        .insert([{ 
          user_id: user.id, 
          file_path: filePath,
          original_name: file.name,
          status: 'uploaded'
        }]);

      if (dbError) throw dbError;

      setSuccess('Blog uploaded successfully! Processing will begin shortly.');
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Upload Your Blog</h2>
      <form onSubmit={handleUpload}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="blog-file">
            Select a file
          </label>
          <input
            id="blog-file"
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white ${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Uploading...' : 'Upload & Process'}
        </button>
        {error && <p className="mt-2 text-red-600">{error}</p>}
        {success && <p className="mt-2 text-green-600">{success}</p>}
      </form>
    </div>
  );
}