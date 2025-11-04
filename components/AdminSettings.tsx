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
    const [removeAdImage, setRemoveAdImage] = useState(false);
    const [ctaEnabled, setCtaEnabled] = useState(false);
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');

    useEffect(() => {
        setGistUrl(currentSyncSettings.gistUrl || '');
        setGithubToken(currentSyncSettings.githubToken || '');
        setAdEnabled(currentAdSettings.enabled);
        setAdText(currentAdSettings.text);
        setAdLink(currentAdSettings.link);
        setCtaEnabled(currentAdSettings.ctaEnabled);
        setCtaText(currentAdSettings.ctaText);
        setCtaLink(currentAdSettings.ctaLink);
        setRemoveAdImage(false); // Reset on prop change
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
        
        const willHaveImage = (adImageFile || currentAdSettings.imageUrl) && !removeAdImage;
        if (adEnabled && (!adText || !willHaveImage)) {
            alert('عند تفعيل الإعلان، يجب توفير نص وصورة.');
            return;
        }

        const submitData = (finalImageUrl: string | null) => {
            onAdSettingsChange({
                enabled: adEnabled,
                text: adText,
                link: adLink,
                imageUrl: finalImageUrl,
                ctaEnabled,
                ctaText,
                ctaLink
            });
            const fileInput = document.getElementById('ad-image') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            setAdImageFile(null);
            setRemoveAdImage(false);
        };
        
        if (removeAdImage) {
            submitData(null);
        } else if (adImageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                submitData(reader.result as string);
            };
            reader.readAsDataURL(adImageFile);
        } else {
            submitData(currentAdSettings.imageUrl);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">إعدادات الأدمن</h2>
                <form onSubmit={handleCredentialsSubmit} className="space-y-4 mb-8">
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

                <div className="pt-6 border-t-2 border-dashed border-gray-200">
                    <h3 className="text-xl font-bold text-center text-yellow-700 mb-4">إعدادات الإعلانات</h3>
                    <form onSubmit={handleAdSettingsSubmit} className="space-y-4">
                        <fieldset className="border border-gray-300 p-4 rounded-lg">
                            <legend className="px-2 font-semibold text-yellow-800">الإعلان الرئيسي</legend>
                             <div className="flex items-center justify-center mb-4">
                                <label htmlFor="ad-enabled" className="text-gray-700 font-semibold ml-3">تفعيل الإعلان</label>
                                <input id="ad-enabled" type="checkbox" checked={adEnabled} onChange={(e) => setAdEnabled(e.target.checked)} className="w-6 h-6 rounded text-yellow-500 focus:ring-yellow-400"/>
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
                                <input id="ad-image" type="file" accept="image/*" onChange={(e) => { setAdImageFile(e.target.files ? e.target.files[0] : null); setRemoveAdImage(false); }} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>
                                {currentAdSettings.imageUrl && !adImageFile && !removeAdImage && (
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-gray-500 text-right">تم رفع صورة بالفعل.</p>
                                        <button 
                                            type="button"
                                            onClick={() => setRemoveAdImage(true)}
                                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded-md font-semibold"
                                        >
                                            حذف الصورة
                                        </button>
                                    </div>
                                )}
                                {removeAdImage && (
                                    <p className="text-xs text-red-600 mt-1 text-right font-semibold">سيتم حذف الصورة عند الحفظ.</p>
                                )}
                            </div>
                        </fieldset>
                        
                        <fieldset className="border border-gray-300 p-4 rounded-lg">
                            <legend className="px-2 font-semibold text-green-800">أيقونة "أعلن معنا"</legend>
                            <div className="flex items-center justify-center mb-4">
                                <label htmlFor="cta-enabled" className="text-gray-700 font-semibold ml-3">تفعيل الأيقونة</label>
                                <input id="cta-enabled" type="checkbox" checked={ctaEnabled} onChange={(e) => setCtaEnabled(e.target.checked)} className="w-6 h-6 rounded text-green-500 focus:ring-green-400"/>
                            </div>
                             <div>
                                <label htmlFor="cta-text" className="block text-right text-gray-700 font-semibold mb-1">نص الأيقونة</label>
                                <input id="cta-text" type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition" />
                            </div>
                             <div>
                                <label htmlFor="cta-link" className="block text-right text-gray-700 font-semibold mb-1">رابط (اختياري)</label>
                                <input id="cta-link" type="url" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="https://example.com/advertise" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition" dir="ltr" />
                            </div>
                        </fieldset>

                        <button type="submit" className="w-full bg-yellow-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-300 shadow-lg text-md">
                            حفظ كل إعدادات الإعلانات
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