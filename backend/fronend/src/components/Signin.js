import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signin.css';
import { toast } from 'react-toastify';

const Signin = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`/auth/signin`, formData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      toast.success('Signin successful! Redirecting to home page...');
      navigate('/');
    } catch (err) {
      console.error('Error signing in', err);
      toast.error('Signin failed. Please check your credentials and try again.');
    }
  };

  return (
    <div className="wrapper">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Signin</h2>
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          required 
        />
        <button type="submit">Signin</button>
      </form>
    </div>
  );
};

export default Signin;
