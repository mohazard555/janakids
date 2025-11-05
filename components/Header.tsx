import React, { useRef } from 'react';

interface HeaderProps {
    logo: string | null;
    onLogoUpload: (file: File) => void;
    isLoggedIn: boolean;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    channelDescription: string;
    onDescriptionChange: (description: string) => void;
}

const CameraIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-200 group-hover:text-white transition-colors" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ logo, onLogoUpload, isLoggedIn, onLoginClick, onLogoutClick, channelDescription, onDescriptionChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => {
        if (isLoggedIn) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onLogoUpload(file);
        }
    };

    return (
        <header className="bg-gradient-to-r from-pink-400 to-yellow-300 text-white p-6 shadow-lg relative">
            <div className="container mx-auto flex justify-between items-center">
                 {/* Logo uploader will be on the right in RTL */}
                <div>
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
                        className={`group w-32 h-32 bg-white/30 rounded-full flex items-center justify-center border-4 border-dashed border-white/50 transition-all duration-300 ${isLoggedIn ? 'cursor-pointer hover:border-white hover:bg-white/40' : 'cursor-default'}`}
                        aria-label="Change channel logo"
                        disabled={!isLoggedIn}
                    >
                        {logo ? (
                            <img src={logo} alt="Channel Logo" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="text-center">
                                <CameraIcon />
                                 {isLoggedIn && <span className="text-xs mt-1 block text-pink-100 group-hover:text-white">أضف شعار</span>}
                            </div>
                        )}
                    </button>
                </div>
                 {/* Text content will be on the left in RTL */}
                <div className="flex-1 text-right mr-8">
                    <h1 className="text-5xl font-black tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                        Jana Kids
                    </h1>
                    <h2 className="text-3xl font-bold mt-4">
                        قصص Jana Kids الرائعة للأطفال
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
                    <p className="mt-6 text-2xl font-bold bg-white/20 p-3 rounded-lg inline-block" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)'}}>
                        🔔 ارجو الاشتراك بالقناة وتفعيل الجرس لتشاهدوا ما هو جديد وممتع 🔔
                    </p>
                </div>
            </div>
            <button
                onClick={isLoggedIn ? onLogoutClick : onLoginClick}
                className={`absolute top-4 left-4 font-bold py-2 px-4 rounded-full transition-colors duration-300 shadow-lg ${
                    isLoggedIn
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
                {isLoggedIn ? 'خروج من وضع الأدمن' : 'الدخول كأدمن'}
            </button>
        </header>
    );
};

export default Header;