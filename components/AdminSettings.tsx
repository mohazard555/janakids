import React, { useState, useEffect, useRef } from 'react';
import type { AdSettings, Ad, Feedback } from '../types';

interface GistSyncSettings {
    githubToken: string;
}

interface FeedbackSyncSettings {
    url: string;
    token: string;
}

interface AdminSettingsProps {
    onCredentialsChange: (credentials: { username: string, password: string }) => void;
    currentCredentials: { username: string, password: string };
    onSubscriptionUrlChange: (url: string) => void;
    currentSubscriptionUrl: string;
    onConfigureAndSync: (settings: GistSyncSettings) => Promise<any>;
    currentSyncSettings: GistSyncSettings;
    onAdSettingsChange: (settings: AdSettings) => void;
    currentAdSettings: AdSettings;
    onExportData: () => void;
    onImportData: (file: File) => void;
    currentFeedback: Feedback[];
    onDeleteFeedback: (feedbackId: number) => void;
    onFeedbackSyncSettingsChange: (settings: FeedbackSyncSettings) => void;
    currentFeedbackSyncSettings: FeedbackSyncSettings;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ 
    onCredentialsChange, 
    currentCredentials,
    onSubscriptionUrlChange,
    currentSubscriptionUrl, 
    onConfigureAndSync, 
    currentSyncSettings,
    onAdSettingsChange,
    currentAdSettings,
    onExportData,
    onImportData,
    currentFeedback,
    onDeleteFeedback,
    onFeedbackSyncSettingsChange,
    currentFeedbackSyncSettings
}) => {
    // General Settings State
    const [username, setUsername] = useState(currentCredentials.username);
    const [password, setPassword] = useState(currentCredentials.password);
    const [subscriptionUrl, setSubscriptionUrl] = useState(currentSubscriptionUrl);

    // Sync State
    const [githubToken, setGithubToken] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    
    // Feedback Sync State
    const [feedbackGistUrl, setFeedbackGistUrl] = useState('');
    const [feedbackGistToken, setFeedbackGistToken] = useState('');

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

    const importFileInputRef = useRef<HTMLInputElement>(null);

    const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );

    useEffect(() => {
        setGithubToken(currentSyncSettings.githubToken || '');
        setFeedbackGistUrl(currentFeedbackSyncSettings.url || '');
        setFeedbackGistToken(currentFeedbackSyncSettings.token || '');
        setLocalAds(currentAdSettings.ads || []);
        setCtaEnabled(currentAdSettings.ctaEnabled);
        setCtaText(currentAdSettings.ctaText);
        setCtaLink(currentAdSettings.ctaLink);
        setSubscriptionUrl(currentSubscriptionUrl || '');
    }, [currentSyncSettings, currentAdSettings, currentSubscriptionUrl, currentFeedbackSyncSettings]);

    useEffect(() => {
        if (adImageFile) {
            const reader = new FileReader();
            reader.onloadend = () => setAdImagePreview(reader.result as string);
            reader.readAsDataURL(adImageFile);
        } else {
            setAdImagePreview(null);
        }
    }, [adImageFile]);

    const handleGeneralSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) { alert('لا يمكن ترك اسم المستخدم أو كلمة المرور فارغة'); return; }
        onCredentialsChange({ username, password });
        onSubscriptionUrlChange(subscriptionUrl);
        alert('تم تحديث الإعدادات العامة بنجاح!');
    };

    const handleFeedbackSyncSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFeedbackSyncSettingsChange({ url: feedbackGistUrl, token: feedbackGistToken });
        alert('تم حفظ إعدادات مزامنة الآراء! ستظهر الآراء الجديدة الآن بشكل مباشر.');
    };
    
    // ... Other handlers (handleSyncSubmit, ad management, etc.) remain largely unchanged ...
    const handleSyncSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsTesting(true);
        try {
            await onConfigureAndSync({ githubToken });
        } catch (error) {
           console.log("Configuration and sync failed, user was notified.");
        } finally {
            setIsTesting(false);
        }
    };
    
    const propagateAdSettingsChange = (newSettings: Partial<AdSettings>) => {
        onAdSettingsChange({
            ads: localAds, ctaEnabled: ctaEnabled, ctaText: ctaText, ctaLink: ctaLink, ...newSettings
        });
    }

    const resetAdForm = () => {
        setEditingAd(null); setAdText(''); setAdLink(''); setAdImageFile(null); setAdImagePreview(null);
        const fileInput = document.getElementById('ad-image-form') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleStartEdit = (ad: Ad) => {
        setEditingAd(ad); setAdText(ad.text); setAdLink(ad.link); setAdImageFile(null); setAdImagePreview(ad.imageUrl);
    };

    const handleDeleteAd = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
            const updatedAds = localAds.filter(ad => ad.id !== id)
            setLocalAds(updatedAds);
            propagateAdSettingsChange({ ads: updatedAds });
        }
    };
    
    const handleAddOrUpdateAd = () => {
        if (!adText || (!adImageFile && !editingAd?.imageUrl)) { alert('يجب توفير نص وصورة للإعلان.'); return; }
        const processAd = (imageUrl: string | null) => {
            let updatedAds;
            if (editingAd) {
                const updatedAd = { ...editingAd, text: adText, link: adLink, imageUrl: imageUrl };
                updatedAds = localAds.map(ad => ad.id === editingAd.id ? updatedAd : ad);
            } else {
                const newAd: Ad = { id: Date.now(), text: adText, link: adLink, imageUrl: imageUrl };
                updatedAds = [...localAds, newAd];
            }
            setLocalAds(updatedAds);
            propagateAdSettingsChange({ ads: updatedAds });
            resetAdForm();
        };
        if (adImageFile) {
            const reader = new FileReader();
            reader.onloadend = () => processAd(reader.result as string);
            reader.readAsDataURL(adImageFile);
        } else {
            processAd(editingAd?.imageUrl || null);
        }
    };
    
    const handleCtaEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCtaEnabled = e.target.checked;
        setCtaEnabled(newCtaEnabled);
        propagateAdSettingsChange({ ctaEnabled: newCtaEnabled });
    };

    const handleCtaTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCtaText = e.target.value;
        setCtaText(newCtaText);
        propagateAdSettingsChange({ ctaText: newCtaText });
    };

    const handleCtaLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCtaLink = e.target.value;
        setCtaLink(newCtaLink);
        propagateAdSettingsChange({ ctaLink: newCtaLink });
    };

    const handleImportClick = () => { importFileInputRef.current?.click(); };
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) onImportData(file);
        event.target.value = '';
    };
    const handleDeleteFeedback = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الرأي؟ سيتم حذفه للجميع بشكل فوري.')) {
            onDeleteFeedback(id);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">إعدادات الأدمن</h2>
                
                {/* General Settings */}
                <form onSubmit={handleGeneralSettingsSubmit} className="space-y-4 mb-8">
                    {/* ... fields ... */}
                </form>

                {/* Ads Management */}
                <div className="pt-6 border-t-2 border-dashed border-gray-200">
                     {/* ... ad fields ... */}
                </div>
                 
                {/* Live Feedback Section */}
                <div className="pt-6 border-t-2 border-dashed border-gray-200 mt-8">
                    <h3 className="text-xl font-bold text-center text-blue-700 mb-3">المزامنة المباشرة لآراء الزوار</h3>
                     <p className="text-gray-600 text-sm mb-4 text-center">
                        لجعل آراء الزوار تظهر للجميع فور إضافتها، يرجى إعداد Gist منفصل وآمن للآراء فقط.
                    </p>
                    <ol className="list-decimal list-inside text-gray-600 text-sm mb-4 space-y-1 text-right bg-blue-50 p-3 rounded-lg">
                         <li>اذهب إلى <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">GitHub Gist</a> وأنشئ Gist جديداً (يمكن أن يكون `secret`).</li>
                         <li>سمّ الملف `jana_kids_feedback.json` وضع `[]` كمحتوى أولي له.</li>
                         <li>أنشئ <strong>Personal Access Token (Classic)</strong> جديداً من إعدادات GitHub مع صلاحية `gist` **فقط**.</li>
                         <li>ألصق رابط ה-Gist والتوكن في الحقول أدناه.</li>
                    </ol>
                    <form onSubmit={handleFeedbackSyncSubmit} className="space-y-4">
                        <fieldset className="border border-blue-300 p-4 rounded-lg space-y-4">
                            <legend className="px-2 font-semibold text-blue-800">إعدادات ربط الآراء</legend>
                            <div>
                                <label htmlFor="feedback-gist-url" className="block text-right text-gray-700 font-semibold mb-1">رابط Gist الخاص بالآراء</label>
                                <input id="feedback-gist-url" type="url" value={feedbackGistUrl} onChange={(e) => setFeedbackGistUrl(e.target.value)} placeholder="https://gist.github.com/username/123..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" dir="ltr" />
                            </div>
                             <div>
                                <label htmlFor="feedback-gist-token" className="block text-right text-gray-700 font-semibold mb-1">GitHub Token (مع صلاحية gist)</label>
                                <input id="feedback-gist-token" type="password" value={feedbackGistToken} onChange={(e) => setFeedbackGistToken(e.target.value)} placeholder="ghp_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" dir="ltr" autoComplete="new-password" />
                            </div>
                        </fieldset>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg text-lg">
                            حفظ إعدادات الآراء
                        </button>
                    </form>
                </div>
                
                {/* Visitor Feedback Display */}
                <div className="pt-6 border-t-2 border-dashed border-gray-200 mt-8">
                    <h3 className="text-xl font-bold text-center text-yellow-700 mb-4">آراء الزوار الحالية</h3>
                    <div className="border border-gray-300 p-4 rounded-lg space-y-3 max-h-60 overflow-y-auto pr-2">
                        {currentFeedback && currentFeedback.length > 0 ? (
                            [...currentFeedback].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(fb => (
                                <div key={fb.id} className="p-2 bg-gray-50 rounded-md">
                                    <div className="flex items-center justify-between mb-1">
                                        <StarRating rating={fb.rating} />
                                        <div className="flex items-center">
                                            <span className="text-xs text-gray-500 ml-3">{new Date(fb.createdAt).toLocaleString('ar-EG')}</span>
                                            <button type="button" onClick={() => handleDeleteFeedback(fb.id)} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded-md font-semibold">حذف</button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-800">{fb.comment}</p>
                                </div>
                            ))
                        ) : (
                             <p className="text-center text-gray-500 py-4">لا توجد آراء حالياً.</p>
                        )}
                    </div>
                </div>
            </div>
            
             {/* Data Management & Main Sync */}
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                 {/* ... import/export buttons ... */}
            </div>
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                <h3 className="text-xl font-bold text-center text-sky-700 mb-3">مزامنة المحتوى الرئيسي (فيديوهات، قوائم، إلخ)</h3>
                 <p className="text-gray-600 text-sm mb-4 text-center">
                    هذا القسم للمحتوى الأساسي. مصدر البيانات محدد في الكود.
                </p>
                <form onSubmit={handleSyncSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="github-token" className="block text-right text-gray-700 font-semibold mb-1">GitHub Personal Access Token</label>
                        <input id="github-token" type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition" dir="ltr" autoComplete="new-password" />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-lg text-md disabled:bg-sky-300 disabled:cursor-not-allowed"
                        disabled={isTesting}
                    >
                        {isTesting ? '...جاري الربط' : 'ربط رمز المزامنة الرئيسي'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
