import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './Navbar.css';
import SearchUser from './SearchUser';
import { toast } from 'react-toastify'; // Import toast

const Navbar = ({ user }) => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigate('/signin'); // Navigate to signin page
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">FeedOn</Link>
      </div>
      
      <div className="navLinks">
        {user ? (
          <>
            <SearchUser />
            <Link to="/">Home</Link>
            <Link to={`/profile/${user?.username}`}>Profile</Link>
            <Link to="/create-post">Create Post</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signin">Signin</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
