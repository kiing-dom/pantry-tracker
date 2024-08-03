import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SignIn from '../auth/SignIn';
import SignOut from '../auth/SignOut';
import { Montserrat } from 'next/font/google';

const mont = Montserrat({
  weight: "700",
  subsets: ["latin"],
});

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-[#9362FF]">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <h1 className={`text-2xl text-white ${mont.className} drop-shadow-md`}>Pantry Tracker™️</h1>
        <div>
          {user ? (
            <SignOut />
          ) : (
            <SignIn />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
