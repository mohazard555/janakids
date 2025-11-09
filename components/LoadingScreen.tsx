
import React, { useState, useEffect } from 'react';

const SunIcon: React.FC = () => (
    <svg className="animate-spin h-24 w-24 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 18a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zM4.22 5.64a1 1 0 011.41-.01l1.42 1.42a1 1 0 01-1.42 1.42L4.22 7.05a1 1 0 01.01-1.41zm14.14 11.32a1 1 0 01-1.41.01l-1.42-1.42a1 1 0 111.42-1.42l1.42 1.42a1 1 0 01-.01 1.41zM2 12a1 1 0 011-1h2a1 1 0 110 2H3a1 1 0 01-1-1zm18 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zM5.64 18.36a1 1 0 01-.01-1.41l1.42-1.42a1 1 0 111.41 1.42l-1.42 1.42a1 1 0 01-1.4-.01zM18.36 5.64a1 1 0 01.01 1.41l-1.42 1.42a1 1 0 01-1.41-1.42l1.42 1.42a1 1 0 011.4.01z"></path>
    </svg>
);

const messages = [
  "جاري تحميل عالم جنى كيدز...",
  "نجهز لكم القصص المسلية...",
  "لحظات ويبدأ اللعب والمرح!",
  "نرسم لكم أجمل الألوان...",
];

interface LoadingScreenProps {
    timeoutMessage?: string | null;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ timeoutMessage }) => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        if (!timeoutMessage) {
            const intervalId = setInterval(() => {
                setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
            }, 2500); // Change message every 2.5 seconds

            return () => clearInterval(intervalId);
        }
    }, [timeoutMessage]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-sky-50 text-sky-600 transition-opacity duration-500">
            <SunIcon />
            <div className="h-10 text-center">
                {timeoutMessage ? (
                     <p className="text-2xl font-bold mt-8 text-sky-700">
                        {timeoutMessage}
                    </p>
                ) : (
                    <p className="text-2xl font-bold mt-8 animate-fade-in-up" key={messageIndex}>
                        {messages[messageIndex]}
                    </p>
                )}
            </div>
            <style>
            {`
              @keyframes fade-in-up {
                0% { 
                    opacity: 0; 
                    transform: translateY(20px); 
                }
                20% {
                    opacity: 1; 
                    transform: translateY(0);
                }
                80% {
                    opacity: 1; 
                    transform: translateY(0);
                }
                100% {
                     opacity: 0; 
                    transform: translateY(-20px);
                }
              }
              .animate-fade-in-up {
                  animation: fade-in-up 2.5s ease-in-out forwards;
              }
            `}
            </style>
        </div>
    );
};

export default LoadingScreen;
