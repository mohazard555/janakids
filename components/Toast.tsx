import React, { useEffect } from 'react';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

interface ToastProps {
  message: ToastMessage | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  const baseStyle = "fixed bottom-5 right-5 text-white px-6 py-3 rounded-lg shadow-xl transition-all duration-500 transform z-50";
  const successStyle = "bg-green-500";
  const errorStyle = "bg-red-500";
  
  const icon = message.type === 'success' ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div 
        className={`${baseStyle} ${message.type === 'success' ? successStyle : errorStyle} flex items-center animate-bounce-in`}
        style={{ animation: 'bounce-in 0.5s ease-out forwards' }}
    >
      <style>
        {`
          @keyframes bounce-in {
            0% {
              opacity: 0;
              transform: scale(0.3) translateY(20px);
            }
            50% {
                transform: scale(1.05) translateY(0);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
      <span>{message.text}</span>
      {icon}
    </div>
  );
};

export default Toast;
