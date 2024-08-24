import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './CreatePost.css';
import { toast } from 'react-toastify';

const CreatePost = ({ user }) => {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let finalImageUrl = imageUrl;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadResponse = await axios.post(`/api/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        finalImageUrl = uploadResponse.data.imageUrl;
      }

      const response = await axios.post(
        `/api/posts`,
        { caption, imageUrl: finalImageUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Post created:', response.data); // Log the response to use the variable
      toast.success('Post created successfully! Redirecting to your profile...');
      navigate(`/profile/${user.username}`); // Navigate to the user's profile page
    } catch (err) {
      console.error('Error creating post', err);
      toast.error('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="wrapper">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Create Post</h2>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption"
          required
          className="input"
        />
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL (optional)"
          className="input"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input"
        />
        <button type="submit" className="button">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
