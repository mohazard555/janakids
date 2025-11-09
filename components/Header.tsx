import React, { useState, useRef } from 'react';
import FeedbackForm from './FeedbackForm';

interface HeaderProps {
    logo: string | null;
    onLogoUpload: (file: File) => void;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    channelDescription: string;
    onDescriptionChange: (description: string) => void;
    videoCount: number;
    subscriptionUrl: string;
    onAddFeedback: (rating: number, comment: string) => void;
    isSubmittingFeedback: boolean;
}

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-200 group-hover:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const RefreshIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ logo, onLogoUpload, isLoggedIn, onLoginClick, onLogoutClick, channelDescription, onDescriptionChange, videoCount, subscriptionUrl, onAddFeedback, isSubmittingFeedback }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showLoginButton, setShowLoginButton] = useState(false);
    const clickTimeoutRef = useRef<number | null>(null);

    const handleLogoClick = () => {
        if (isLoggedIn) {
            fileInputRef.current?.click();
            return;
        }

        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }

        const newClickCount = logoClickCount + 1;
        setLogoClickCount(newClickCount);

        if (newClickCount >= 5) {
            setShowLoginButton(true);
            setLogoClickCount(0); // Reset after showing
        } else {
            // Set a new timeout to reset clicks if the user is too slow
            clickTimeoutRef.current = window.setTimeout(() => {
                setLogoClickCount(0);
            }, 1500); // 1.5 seconds to complete the 5 clicks
        }
    };

    const handleLogout = () => {
        onLogoutClick();
        setShowLoginButton(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLogoUpload(file);
        }
    };

    const SubscriptionContent: React.FC = () => (
        <p className="mt-6 text-2xl font-bold bg-white/20 p-3 rounded-lg inline-block" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>
            🔔 ارجو الاشتراك بالقناة وتفعيل الجرس لتشاهدوا ما هو جديد وممتع 🔔
        </p>
    );

    return (
        <header className="bg-gradient-to-r from-pink-400 to-yellow-300 text-white p-6 shadow-lg relative">
            <div className="container mx-auto flex justify-between items-start">
                 {/* Logo uploader will be on the right in RTL */}
                <div className="flex flex-col items-center w-48">
                    {isLoggedIn && (
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            aria-label="Upload channel logo"
                        />
                    )}
                    <button
                        onClick={handleLogoClick}
                        className={`group w-32 h-32 bg-white/30 rounded-full flex items-center justify-center border-4 border-dashed border-white/50 transition-all duration-300 cursor-pointer ${isLoggedIn ? 'hover:border-white hover:bg-white/40' : ''}`}
                        aria-label={isLoggedIn ? "Change channel logo" : "Channel logo (click 5 times for admin login)"}
                    >
                        {logo ? (
                            <div className="relative w-full h-full">
                                <img src={logo} alt="Channel Logo" className="w-full h-full rounded-full object-cover" />
                                {isLoggedIn && (
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <EditIcon />
                                        <span className="text-xs text-white mt-1 font-bold">تغيير الشعار</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <CameraIcon />
                                 {isLoggedIn && <span className="text-xs mt-1 block text-pink-100 group-hover:text-white">أضف شعار</span>}
                            </div>
                        )}
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 flex items-center justify-center px-5 py-2 bg-white/20 hover:bg-white/40 text-white font-bold rounded-full transition-colors duration-300"
                        aria-label="Refresh the page"
                    >
                        <RefreshIcon />
                        <span>تحديث</span>
                    </button>
                    <FeedbackForm onAddFeedback={onAddFeedback} isSubmitting={isSubmittingFeedback} />
                </div>
                 {/* Text content will be on the left in RTL */}
                <div className="flex-1 text-right mr-8">
                    <h1 className="text-5xl font-black tracking-wider flex items-center justify-end" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                        <span>Jana Kids</span>
                        <span className="text-base font-bold bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full mr-4">{videoCount} فيديوهات</span>
                    </h1>
                    <h2 className="text-3xl font-bold mt-4">
                        مغامرات وقصص Jana Kids للأطفال
                    </h2>
                    {isLoggedIn ? (
                        <textarea
                            value={channelDescription}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                            className="text-lg mt-2 font-light w-full bg-white/20 p-2 rounded-lg border-2 border-transparent focus:border-white focus:bg-white/30 outline-none transition-all resize-none"
                            placeholder="اكتب وصفاً للقناة هنا..."
                            rows={3}
                            aria-label="Edit channel description"
                        />
                    ) : (
                        <p className="text-lg mt-2 font-light min-h-[5.25rem]">
                            {channelDescription}
                        </p>
                    )}
                    {subscriptionUrl ? (
                         <a href={subscriptionUrl} target="_blank" rel="noopener noreferrer" className="inline-block transition-transform duration-300 hover:scale-105">
                           <SubscriptionContent />
                         </a>
                    ) : (
                        <SubscriptionContent />
                    )}
                </div>
            </div>
            {(isLoggedIn || showLoginButton) && (
                <button
                    onClick={isLoggedIn ? handleLogout : onLoginClick}
                    className={`absolute top-4 left-4 font-bold py-2 px-4 rounded-full transition-colors duration-300 shadow-lg ${
                        isLoggedIn
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white animate-fade-in'
                    }`}
                >
                    {isLoggedIn ? 'خروج من وضع الأدمن' : 'الدخول كأدمن'}
                </button>
            )}
        </header>
    );
};

export default Header;
