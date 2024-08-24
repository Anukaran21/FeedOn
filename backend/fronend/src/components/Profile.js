import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { username } = useParams(); // Extract username from URL params
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        console.error('Username is undefined');
        return; // Ensure username is defined
      }
      try {
        const response = await axios.get(`/api/users/${username}`);
        const userData = response.data.user;
        const postsData = response.data.posts;

        // Deduplicate followers and following lists
        const uniqueFollowers = deduplicateUsers(userData.followers);
        const uniqueFollowing = deduplicateUsers(userData.following);

        setUser(userData);
        setPosts(postsData);
        setFollowersCount(uniqueFollowers.length);
        setFollowingCount(uniqueFollowing.length);
        setFollowers(uniqueFollowers);
        setFollowing(uniqueFollowing);

        const currentUserId = localStorage.getItem('userId');
        setIsCurrentUser(userData._id === currentUserId);
        setIsFollowing(uniqueFollowers.some(follower => follower._id === currentUserId));
      } catch (err) {
        console.error('Error fetching user profile', err);
      }
    };

    fetchUserProfile();
  }, [username]);

  const deduplicateUsers = (users) => {
    const seen = new Set();
    return users.filter(user => {
      const duplicate = seen.has(user._id);
      seen.add(user._id);
      return !duplicate;
    });
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/users/follow/${user._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Update local state with the response data
      const uniqueFollowers = deduplicateUsers(response.data.followers);
      setFollowers(uniqueFollowers);
      setFollowersCount(uniqueFollowers.length);
      setIsFollowing(true);
    } catch (err) {
      console.error('Error following user', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `/api/users/follow/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // Update local state with the response data
      const uniqueFollowers = deduplicateUsers(response.data.followers);
      setFollowers(uniqueFollowers);
      setFollowersCount(uniqueFollowers.length);
      setIsFollowing(false);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        console.error('Version conflict detected. Retrying...');
        // Implement retry logic or notify the user
      } else {
        console.error('Error unfollowing user', err);
      }
    }
  };

  return (
    <div className="container">
      {user && (
        <div className="profile">
          <div className="profile-header">
            <h1 className="username">{user.username}</h1>
            <p className="bio">{user.bio}</p>
            {!isCurrentUser && (
              <div>
                {isFollowing ? (
                  <button onClick={handleUnfollow} className="button unfollow-button">Unfollow</button>
                ) : (
                  <button onClick={handleFollow} className="button follow-button">Follow</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="counts">
        <p><strong>{posts.length}</strong> posts</p>
        <p>
          <strong>{followersCount}</strong> followers
          <button onClick={() => setShowFollowers(!showFollowers)}>
            {showFollowers ? 'Hide' : 'Show'} Followers
          </button>
        </p>
        <p>
          <strong>{followingCount}</strong> following
          <button onClick={() => setShowFollowing(!showFollowing)}>
            {showFollowing ? 'Hide' : 'Show'} Following
          </button>
        </p>
      </div>

      {showFollowers && (
        <>
          <h2>Followers</h2>
          <div className="followers">
            {followers.map(follower => (
              <div key={follower._id}>
                <Link to={`/profile/${follower.username}`} className="link">{follower.username}</Link>
              </div>
            ))}
          </div>
        </>
      )}

      {showFollowing && (
        <>
          <h2>Following</h2>
          <div className="following">
            {following.map(followingUser => (
              <div key={followingUser._id}>
                <Link to={`/profile/${followingUser.username}`} className="link">{followingUser.username}</Link>
              </div>
            ))}
          </div>
        </>
      )}

      <h2>Posts</h2>
      <div className="posts">
        {posts.map(post => (
          <div key={post._id} className="post">
            <img src={post.imageUrl} alt={post.caption} className="image" />
            <p className="caption">{post.caption}</p>
            {!isCurrentUser && (
              <button onClick={() => handleDeletePost(post._id)} className="deleteButton">Delete Post</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
