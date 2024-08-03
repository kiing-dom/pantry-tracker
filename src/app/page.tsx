"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import PantryItems from './components/Pantry';
import Landing from './components/Landing';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box'; // Import Box for layout

const Home = () => {
  const { user, loginWithGoogle } = useAuth(); // Assume `login` is a function provided by useAuth
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false); // Add state for login loading

  useEffect(() => {
    const checkAuth = async () => {
      setLoginLoading(true); // Start spinner when checking auth
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async check
      setLoginLoading(false); // Stop spinner after check
      setLoading(false); // Update loading state
    };

    checkAuth();
  }, []);

  if (loading || loginLoading) { // Show spinner if either loading state is true
    return (
      <Box
        sx={{
          backgroundColor: '#f8f8ff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '84vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      {user ? (
        <PantryItems />
      ) : (
        <Landing />
      )}
    </div>
  );
};

export default Home;
