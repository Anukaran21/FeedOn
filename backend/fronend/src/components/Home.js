import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast for notifications
import { FcLike } from "react-icons/fc"; // for icons
import { IoIosSend } from "react-icons/io";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/posts`);

        // Check if the response is in JSON format
        if (response.headers['content-type'].includes('application/json')) {
          // Ensure data is an array and correctly structured
          if (Array.isArray(response.data)) {
            setPosts(response.data.map(post => ({
              ...post,
              likes: Array.isArray(post.likes) ? post.likes : [], // Ensure likes is an array
              comments: Array.isArray(post.comments) ? post.comments : [] // Ensure comments is an array
            })));
          } else {
            console.error('Unexpected data structure:', response.data);
            toast.error('Unexpected data structure. Please try again.');
          }
        } else {
          console.error('Response is not JSON:', response);
          toast.error('Unexpected server response. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching posts', err);
        toast.error('Failed to load posts. Please try again.');
      }
    };

    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, likes: [...post.likes, { _id: postId }] } : post
      ));
      toast.success('Post liked!');
    } catch (err) {
      console.error('Error liking post', err);
      toast.error('Failed to like post. Please try again.');
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/posts/${postId}/comment`, { comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.map(post =>
        post._id === postId ? { ...post, comments: Array.isArray(response.data.comments) ? response.data.comments : [] } : post
      ));
      toast.success('Comment added!');
    } catch (err) {
      console.error('Error commenting on post', err);
      toast.error('Failed to add comment. Please try again.');
    }
  };

  return (
    <div className="container">
      <h1>Home</h1>
      {Array.isArray(posts) && posts.map(post => (
        <div key={post._id} className="post">
          <Link to={`/profile/${post.user.username}`} className="username">{post.user.username}</Link>
          <img src={post.imageUrl} alt={post.caption} className="image" />
          <p className="caption">{post.caption}</p>
          <button className="button" onClick={() => handleLike(post._id)}>
            <FcLike /> ({post.likes.length})
          </button>
          <div className="comments">
            {Array.isArray(post.comments) && post.comments.map((comment, index) => (
              <p key={index}>
                <strong>{comment.user.username}:</strong> {comment.comment}
              </p>
            ))}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleComment(post._id, e.target.comment.value);
              e.target.comment.value = '';
            }}>
              <input type="text" name="comment" placeholder="Add a comment" required className="input" />
              <button type="submit" className="button"><IoIosSend /></button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
