import React, { useState, useEffect } from 'react';
import type { AdSettings } from '../types';

interface GistSyncSettings {
    gistUrl: string;
    githubToken: string;
}

interface AdminSettingsProps {
    onCredentialsChange: (credentials: { username: string, password: string }) => void;
    currentCredentials: { username: string, password: string };
    onSyncSettingsChange: (settings: GistSyncSettings) => void;
    currentSyncSettings: GistSyncSettings;
    onAdSettingsChange: (settings: AdSettings) => void;
    currentAdSettings: AdSettings;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ 
    onCredentialsChange, 
    currentCredentials, 
    onSyncSettingsChange, 
    currentSyncSettings,
    onAdSettingsChange,
    currentAdSettings
}) => {
    const [username, setUsername] = useState(currentCredentials.username);
    const [password, setPassword] = useState(currentCredentials.password);
    const [gistUrl, setGistUrl] = useState('');
    const [githubToken, setGithubToken] = useState('');

    const [adEnabled, setAdEnabled] = useState(false);
    const [adText, setAdText] = useState('');
    const [adLink, setAdLink] = useState('');
    const [adImageFile, setAdImageFile] = useState<File | null>(null);

    useEffect(() => {
        setGistUrl(currentSyncSettings.gistUrl || '');
        setGithubToken(currentSyncSettings.githubToken || '');
        setAdEnabled(currentAdSettings.enabled);
        setAdText(currentAdSettings.text);
        setAdLink(currentAdSettings.link);
    }, [currentSyncSettings, currentAdSettings]);

    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            alert('لا يمكن ترك اسم المستخدم أو كلمة المرور فارغة');
            return;
        }
        onCredentialsChange({ username, password });
        alert('تم تحديث معلومات تسجيل الدخول بنجاح!');
    };

    const handleSyncSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSyncSettingsChange({ gistUrl, githubToken });
    };

    const handleAdSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (adEnabled && (!adText || (!adImageFile && !currentAdSettings.imageUrl))) {
            alert('عند تفعيل الإعلان، يجب توفير نص وصورة.');
            return;
        }

        const processAndSubmit = (imageUrl: string | null) => {
            onAdSettingsChange({
                enabled: adEnabled,
                text: adText,
                link: adLink,
                imageUrl: imageUrl
            });
             const fileInput = document.getElementById('ad-image') as HTMLInputElement;
             if (fileInput) fileInput.value = '';
             setAdImageFile(null);
        }
        
        if (adImageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                processAndSubmit(reader.result as string);
            };
            reader.readAsDataURL(adImageFile);
        } else {
            processAndSubmit(currentAdSettings.imageUrl);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">إعدادات الأدمن</h2>
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="admin-username" className="block text-right text-gray-700 font-semibold mb-1">
                            اسم مستخدم الأدمن
                        </label>
                        <input
                            id="admin-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition"
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label htmlFor="admin-password" className="block text-right text-gray-700 font-semibold mb-1">
                            كلمة مرور الأدمن
                        </label>
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition"
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300 shadow-lg text-lg"
                    >
                        حفظ بيانات الدخول
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                    <h3 className="text-xl font-bold text-center text-yellow-700 mb-3">إعدادات الإعلان</h3>
                    <form onSubmit={handleAdSettingsSubmit} className="space-y-4">
                        <div className="flex items-center justify-center">
                            <label htmlFor="ad-enabled" className="text-gray-700 font-semibold ml-3">تفعيل الإعلان</label>
                            <input
                                id="ad-enabled"
                                type="checkbox"
                                checked={adEnabled}
                                onChange={(e) => setAdEnabled(e.target.checked)}
                                className="w-6 h-6 rounded text-yellow-500 focus:ring-yellow-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="ad-text" className="block text-right text-gray-700 font-semibold mb-1">نص الإعلان</label>
                            <input id="ad-text" type="text" value={adText} onChange={(e) => setAdText(e.target.value)} placeholder="عرض خاص لفترة محدودة!" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition" />
                        </div>
                        <div>
                            <label htmlFor="ad-link" className="block text-right text-gray-700 font-semibold mb-1">رابط الإعلان (اختياري)</label>
                            <input id="ad-link" type="url" value={adLink} onChange={(e) => setAdLink(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition" dir="ltr" />
                        </div>
                         <div>
                            <label htmlFor="ad-image" className="block text-right text-gray-700 font-semibold mb-1">صورة الإعلان</label>
                            <input
                                id="ad-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAdImageFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
                            />
                            {currentAdSettings.imageUrl && !adImageFile && <p className="text-xs text-gray-500 mt-1 text-right">تم رفع صورة بالفعل. اختر ملف جديد لتغييرها.</p>}
                        </div>
                        <button type="submit" className="w-full bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-300 shadow-lg text-md">
                            حفظ إعدادات الإعلان
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                <h3 className="text-xl font-bold text-center text-sky-700 mb-3">تمكين المزامنة عبر الإنترنت</h3>
                <ol className="list-decimal list-inside text-gray-600 text-sm mb-4 space-y-1 text-right">
                    <li>ألصق <strong>Gist Raw URL</strong> في الحقل أدناه ليكون مصدر بيانات الموقع.</li>
                    <li>أنشئ <strong>(Personal Access Token (Classic</strong> من إعدادات GitHub مع صلاحية `gist` فقط.</li>
                    <li>ألصق الـ <strong>Token</strong> في الحقل الثاني لتمكين الحفظ والمزامنة.</li>
                </ol>
                <form onSubmit={handleSyncSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="gist-url" className="block text-right text-gray-700 font-semibold mb-1">رابط Gist Raw للمزامنة</label>
                        <input id="gist-url" type="url" value={gistUrl} onChange={(e) => setGistUrl(e.target.value)} placeholder="https://gist.githubusercontent.com/user/123.../raw/data.json" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition" dir="ltr" autoComplete="off" />
                    </div>
                    <div>
                        <label htmlFor="github-token" className="block text-right text-gray-700 font-semibold mb-1">GitHub Personal Access Token</label>
                        <input id="github-token" type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition" dir="ltr" autoComplete="new-password" />
                    </div>
                    <button type="submit" className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-lg text-md">
                        حفظ إعدادات المزامنة
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
