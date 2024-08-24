import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SearchUser.css'; // Import the CSS file
import { toast } from 'react-toastify'; // Import toast

const SearchUser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.warn('Please enter a search term!');
      return;
    }

    try {
      const response = await axios.get(`/api/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.length > 0) {
        setSearchResults(response.data);
        toast.success('Users found!');
      } else {
        setSearchResults([]);
        toast.info('No users found!');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users. Please try again.');
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
        placeholder="Search users..."
      />
      <button onClick={handleSearch} className="search-button">Search</button>
      <ul className="user-list">
        {searchResults.map(user => (
          <li key={user._id} className="user-item">
            <div>
              <span>{user.username}</span>
              <div className="user-links">
                <Link to={`/profile/${user.username}`}>Profile</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchUser;
