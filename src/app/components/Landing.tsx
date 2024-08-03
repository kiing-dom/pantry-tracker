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
            className="bg-[url('/purty_wood.png')] bg-center h-[84vh] flex items-center justify-center"
        >
            <div
                className="
                relative
                max-w-md
                max-h-[40vh]
                h-full
                w-full
                p-4
                sm:p-6
                bg-white
                bg-opacity-20
                backdrop-blur-md
                rounded-lg
                shadow-lg
                border
                border-gray-300
                text-center
                hover:scale-110 transition-transform
                flex
                items-center
                "
            >
                {/* Container for Icon and Text */}
                <div className="flex items-center w-full">
                    <img src="/chibi-bread.png" alt="Icon" className="w-36 mr-4" />

                    {/* Text and SignIn Button Container */}
                    <div className="flex flex-col w-full text-left">
                        <h1 className={`text-4xl font-bold mb-2 ${mont.className} text-black`}>
                            Pantry Tracker
                        </h1>
                        <h2 className="text-[14px] mb-4 italic font-semibold text-[#a8a5a5]">
                            Smart Tracking For Your Pantry
                        </h2>
                        <SignIn />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
