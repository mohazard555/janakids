import React, { useState, useEffect } from 'react';
import type { AdSettings, Ad } from '../types';

interface GistSyncSettings {
    gistUrl: string;
    githubToken: string;
}

interface AdminSettingsProps {
    onCredentialsChange: (credentials: { username: string, password: string }) => void;
    currentCredentials: { username: string, password: string };
    onTestAndLoadFromGist: (settings: GistSyncSettings) => Promise<any>;
    currentSyncSettings: GistSyncSettings;
    onAdSettingsChange: (settings: AdSettings) => void;
    currentAdSettings: AdSettings;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ 
    onCredentialsChange, 
    currentCredentials, 
    onTestAndLoadFromGist, 
    currentSyncSettings,
    onAdSettingsChange,
    currentAdSettings
}) => {
    // Credentials State
    const [username, setUsername] = useState(currentCredentials.username);
    const [password, setPassword] = useState(currentCredentials.password);

    // Sync State
    const [gistUrl, setGistUrl] = useState('');
    const [githubToken, setGithubToken] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    // Ads Management State
    const [localAds, setLocalAds] = useState<Ad[]>([]);
    const [ctaEnabled, setCtaEnabled] = useState(false);
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');

    // Ad Add/Edit Form State
    const [editingAd, setEditingAd] = useState<Ad | null>(null);
    const [adText, setAdText] = useState('');
    const [adLink, setAdLink] = useState('');
    const [adImageFile, setAdImageFile] = useState<File | null>(null);
    const [adImagePreview, setAdImagePreview] = useState<string | null>(null);

    useEffect(() => {
        setGistUrl(currentSyncSettings.gistUrl || '');
        setGithubToken(currentSyncSettings.githubToken || '');
        setLocalAds(currentAdSettings.ads || []);
        setCtaEnabled(currentAdSettings.ctaEnabled);
        setCtaText(currentAdSettings.ctaText);
        setCtaLink(currentAdSettings.ctaLink);
    }, [currentSyncSettings, currentAdSettings]);

    useEffect(() => {
        if (adImageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdImagePreview(reader.result as string);
            };
            reader.readAsDataURL(adImageFile);
        } else {
            setAdImagePreview(null);
        }
    }, [adImageFile]);


    const handleCredentialsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            alert('لا يمكن ترك اسم المستخدم أو كلمة المرور فارغة');
            return;
        }
        onCredentialsChange({ username, password });
        alert('تم تحديث معلومات تسجيل الدخول بنجاح!');
    };

    const handleSyncSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsTesting(true);
        try {
            await onTestAndLoadFromGist({ gistUrl, githubToken });
        } catch (error) {
           // Error toast is handled in the parent component
           console.log("Test and load failed, user was notified.");
        } finally {
            setIsTesting(false);
        }
    };

    const handleSaveAllAdSettings = (e: React.FormEvent) => {
        e.preventDefault();
        onAdSettingsChange({
            ads: localAds,
            ctaEnabled,
            ctaText,
            ctaLink
        });
    };

    const resetAdForm = () => {
        setEditingAd(null);
        setAdText('');
        setAdLink('');
        setAdImageFile(null);
        setAdImagePreview(null);
        const fileInput = document.getElementById('ad-image-form') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleStartEdit = (ad: Ad) => {
        setEditingAd(ad);
        setAdText(ad.text);
        setAdLink(ad.link);
        setAdImageFile(null);
        setAdImagePreview(ad.imageUrl);
    };

    const handleDeleteAd = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
            setLocalAds(prev => prev.filter(ad => ad.id !== id));
        }
    };
    
    const handleAddOrUpdateAd = () => {
        if (!adText || (!adImageFile && !editingAd?.imageUrl)) {
            alert('يجب توفير نص وصورة للإعلان.');
            return;
        }

        const processAd = (imageUrl: string | null) => {
            if (editingAd) {
                const updatedAd = { ...editingAd, text: adText, link: adLink, imageUrl: imageUrl };
                setLocalAds(prev => prev.map(ad => ad.id === editingAd.id ? updatedAd : ad));
            } else {
                const newAd: Ad = {
                    id: Date.now(),
                    text: adText,
                    link: adLink,
                    imageUrl: imageUrl
                };
                setLocalAds(prev => [...prev, newAd]);
            }
            resetAdForm();
        };

        if (adImageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                processAd(reader.result as string);
            };
            reader.readAsDataURL(adImageFile);
        } else {
            processAd(editingAd?.imageUrl || null);
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
                        <input id="admin-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition" autoComplete="username" />
                    </div>
                    <div>
                        <label htmlFor="admin-password" className="block text-right text-gray-700 font-semibold mb-1">
                            كلمة مرور الأدمن
                        </label>
                        <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition" autoComplete="current-password" />
                    </div>
                    <button type="submit" className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300 shadow-lg text-lg">
                        حفظ بيانات الدخول
                    </button>
                </form>

                <form onSubmit={handleSaveAllAdSettings} className="pt-6 border-t-2 border-dashed border-gray-200">
                    <h3 className="text-xl font-bold text-center text-yellow-700 mb-4">إدارة الإعلانات</h3>
                    
                    <fieldset className="border border-gray-300 p-4 rounded-lg mb-4">
                        <legend className="px-2 font-semibold text-yellow-800">الإعلانات الرئيسية</legend>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {localAds.map(ad => (
                                <div key={ad.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                    <img src={ad.imageUrl || undefined} alt={ad.text} className="w-12 h-12 object-cover rounded-md flex-shrink-0 mr-3" />
                                    <p className="flex-grow text-sm text-gray-700 truncate">{ad.text}</p>
                                    <div className="flex space-x-2 flex-shrink-0">
                                        <button type="button" onClick={() => handleStartEdit(ad)} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-md font-semibold">تعديل</button>
                                        <button type="button" onClick={() => handleDeleteAd(ad.id)} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded-md font-semibold">حذف</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {localAds.length === 0 && <p className="text-center text-gray-500 py-4">لا توجد إعلانات حالياً.</p>}
                    </fieldset>

                     <fieldset className="border border-gray-300 p-4 rounded-lg space-y-4 mb-4">
                        <legend className="px-2 font-semibold text-yellow-800">{editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</legend>
                         <div>
                            <label htmlFor="ad-text-form" className="block text-right text-gray-700 font-semibold mb-1">نص الإعلان</label>
                            <input id="ad-text-form" type="text" value={adText} onChange={(e) => setAdText(e.target.value)} placeholder="عرض خاص لفترة محدودة!" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition" />
                        </div>
                        <div>
                            <label htmlFor="ad-link-form" className="block text-right text-gray-700 font-semibold mb-1">رابط الإعلان (اختياري)</label>
                            <input id="ad-link-form" type="url" value={adLink} onChange={(e) => setAdLink(e.target.value)} placeholder="https://example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition" dir="ltr" />
                        </div>
                        <div>
                            <label htmlFor="ad-image-form" className="block text-right text-gray-700 font-semibold mb-1">صورة الإعلان</label>
                            <input id="ad-image-form" type="file" accept="image/*" onChange={(e) => setAdImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"/>
                             {(adImagePreview) && <img src={adImagePreview} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-md mx-auto"/>}
                        </div>
                        <div className="flex items-center space-x-2">
                             <button type="button" onClick={handleAddOrUpdateAd} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                                {editingAd ? 'حفظ التعديلات' : 'إضافة الإعلان'}
                            </button>
                            {editingAd && (
                                <button type="button" onClick={resetAdForm} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                    إلغاء التعديل
                                </button>
                            )}
                        </div>
                    </fieldset>

                    <fieldset className="border border-gray-300 p-4 rounded-lg mb-4">
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
                    <button 
                        type="submit" 
                        className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-lg text-md disabled:bg-sky-300 disabled:cursor-not-allowed"
                        disabled={isTesting}
                    >
                        {isTesting ? '...جاري الاختبار' : 'اختبار الاتصال وتحميل البيانات'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;