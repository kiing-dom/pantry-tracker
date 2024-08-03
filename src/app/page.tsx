"use client"

import React from 'react';
import { useAuth } from './context/AuthContext'
import SignIn from './components/auth/SignIn';
import SignOut from './components/auth/SignOut';
import PantryItems from './components/Pantry';
import Landing from './components/Landing';
const Home = () => {
  const { user } = useAuth();

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
