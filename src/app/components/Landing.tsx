import React from 'react';
import SignIn from './auth/SignIn';
import { Montserrat } from 'next/font/google';

const mont = Montserrat({
    weight: "700",
    subsets: ["latin"],
});

const Landing: React.FC = () => {
    return (
        <div
            className="bg-[url('http://cdn.backgroundhost.com/backgrounds/subtlepatterns/purty_wood.png')] bg-center h-[84vh] flex items-center justify-center"
        >
            <div className="relative max-w-md max-h-[40vh] h-full w-full p-4 sm:p-6 bg-white bg-opacity-20 backdrop-blur-md rounded-lg shadow-lg border border-gray-300 text-center">
                <div className="mb-4 flex justify-center">
                    <img src="/wreath.png" alt="Icon" className="w-36" />
                </div>
                <h1 className={`text-4xl font-bold mb-2 ${mont.className} text-black`}>
                    Pantry Tracker
                </h1>
                <h2 className="text-xl mb-4 italic font-semibold text-[#a8a5a5] ">
                    Sign In to Your Account
                </h2>
                
                <SignIn />
                
                
            </div>
        </div>
    );
};

export default Landing;
