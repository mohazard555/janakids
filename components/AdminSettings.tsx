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

    // Main Sync State
    const [githubToken, setGithubToken] = useState('');
    const [mainSyncStatus, setMainSyncStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [mainSyncError, setMainSyncError] = useState<string | null>(null);

    // Feedback Sync State
    const [feedbackGistUrl, setFeedbackGistUrl] = useState('');
    const [feedbackGistToken, setFeedbackGistToken] = useState('');
    const [feedbackTestStatus, setFeedbackTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [feedbackTestError, setFeedbackTestError] = useState<string | null>(null);
    const [showInstructions, setShowInstructions] = useState(false);

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
        setUsername(currentCredentials.username);
        setPassword(currentCredentials.password);
    }, [currentSyncSettings, currentAdSettings, currentSubscriptionUrl, currentFeedbackSyncSettings, currentCredentials]);

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

    const getGistId = (url: string): string | null => {
        if (!url) return null;
        const match = url.match(/gist\.github(?:usercontent)?\.com\/[^\/]+\/([a-f0-9]+)/);
        return match ? match[1] : null;
    };

    const handleFeedbackSyncSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedbackTestStatus('testing');
        setFeedbackTestError(null);
        try {
            const gistId = getGistId(feedbackGistUrl);
            if (!gistId) throw new Error("رابط Gist غير صالح. يرجى التأكد من نسخ الرابط الصحيح.");
            if (!feedbackGistToken.trim()) throw new Error("رمز GitHub مطلوب.");
    
            const GIST_API_URL = `https://api.github.com/gists/${gistId}`;
            const AUTH_HEADERS = { 'Authorization': `token ${feedbackGistToken.trim()}`, 'Accept': 'application/vnd.github.v3+json' };
            const FEEDBACK_FILENAME = 'jana_kids_feedback.json';
    
            // Step 1: GET to verify read access and file existence
            const getResponse = await fetch(GIST_API_URL, { headers: AUTH_HEADERS });
            const getData = await getResponse.json();
            if (!getResponse.ok) {
                throw new Error(getData.message || `فشل الاتصال الأولي (Status: ${getResponse.status})`);
            }
            if (!getData.files || !getData.files[FEEDBACK_FILENAME]) {
                throw new Error(`لم يتم العثور على الملف '${FEEDBACK_FILENAME}' في هذا الـ Gist. الرجاء التأكد من التسمية الصحيحة.`);
            }
            const currentContent = getData.files[FEEDBACK_FILENAME].content;
    
            // Step 2: PATCH with same content to verify write access
            const patchResponse = await fetch(GIST_API_URL, {
                method: 'PATCH',
                headers: { ...AUTH_HEADERS, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: {
                        [FEEDBACK_FILENAME]: { content: currentContent || '[]' }
                    }
                })
            });
    
            if (!patchResponse.ok) {
                const patchData = await patchResponse.json().catch(() => ({}));
                let detailedErrorMessage = patchData.message || `فشل اختبار الكتابة (Status: ${patchResponse.status})`;
                if (patchResponse.status === 403 || patchResponse.status === 401 || (patchData.message && patchData.message.toLowerCase().includes('credential'))) {
                     detailedErrorMessage = `Bad credentials. هذا يعني أن الرمز يمكنه قراءة الـ Gist لكنه لا يملك صلاحية التعديل عليه. الرجاء مراجعة الرابط والرمز والمحاولة مرة أخرى. تأكد من أن الرمز من نوع "Classic" ويملك صلاحية "gist" للكتابة.`;
                }
                throw new Error(detailedErrorMessage);
            }
    
            setFeedbackTestStatus('success');
            onFeedbackSyncSettingsChange({ url: feedbackGistUrl, token: feedbackGistToken });
        } catch (error) {
            setFeedbackTestStatus('error');
            setFeedbackTestError((error as Error).message);
        }
    };
    
    const handleSyncSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMainSyncStatus('testing');
        setMainSyncError(null);
        try {
            await onConfigureAndSync({ githubToken });
            setMainSyncStatus('success');
        } catch (error) {
           setMainSyncStatus('error');
           setMainSyncError((error as Error).message);
        }
    };
    
    const propagateAdSettingsChange = () => {
        onAdSettingsChange({
            ads: localAds, ctaEnabled: ctaEnabled, ctaText: ctaText, ctaLink: ctaLink
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
            onAdSettingsChange({ ads: updatedAds, ctaEnabled, ctaText, ctaLink });
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
            onAdSettingsChange({ ads: updatedAds, ctaEnabled, ctaText, ctaLink });
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
    
    const handleCtaSettingsSave = (e: React.FormEvent) => {
        e.preventDefault();
        propagateAdSettingsChange();
        alert('تم حفظ إعدادات الإعلان.');
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
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col space-y-8">
            <h2 className="text-2xl font-bold text-center text-gray-700">إعدادات الأدمن</h2>
            
            {/* General Settings */}
            <form onSubmit={handleGeneralSettingsSubmit} className="space-y-4 pt-6 border-t-2 border-dashed border-gray-200">
                <h3 className="text-xl font-bold text-center text-gray-700 mb-3">الإعدادات العامة</h3>
                <div>
                    <label htmlFor="admin-username" className="block text-right text-gray-700 font-semibold mb-1">اسم المستخدم للأدمن</label>
                    <input id="admin-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition" />
                </div>
                <div>
                    <label htmlFor="admin-password" className="block text-right text-gray-700 font-semibold mb-1">كلمة المرور للأدمن</label>
                    <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition" />
                </div>
                <div>
                    <label htmlFor="sub-url" className="block text-right text-gray-700 font-semibold mb-1">رابط الاشتراك في القناة (يظهر عند الضغط على الجرس)</label>
                    <input id="sub-url" type="url" value={subscriptionUrl} onChange={(e) => setSubscriptionUrl(e.target.value)} placeholder="https://www.youtube.com/channel/..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition" dir="ltr" />
                </div>
                <button type="submit" className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">حفظ الإعدادات العامة</button>
            </form>

            {/* Ads Management */}
            <div className="pt-6 border-t-2 border-dashed border-gray-200">
                <h3 className="text-xl font-bold text-center text-green-700 mb-3">إدارة الإعلانات</h3>
                <div className="space-y-4">
                    <form onSubmit={handleCtaSettingsSave} className="space-y-2 border border-green-200 p-3 rounded-lg">
                        <div className="flex items-center">
                            <input type="checkbox" id="cta-enabled" checked={ctaEnabled} onChange={(e) => setCtaEnabled(e.target.checked)} className="ml-2 h-4 w-4" />
                            <label htmlFor="cta-enabled" className="font-semibold text-gray-700">تفعيل زر "للإعلان معنا" العائم</label>
                        </div>
                        {ctaEnabled && (
                            <div className="space-y-2 animate-fade-in-fast pt-2">
                                <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="النص على الزر" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 transition" />
                                <input type="url" value={ctaLink} onChange={(e) => setCtaLink(e.target.value)} placeholder="الرابط (اختياري)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 transition" dir="ltr" />
                            </div>
                        )}
                        <button type="submit" className="w-full text-sm bg-green-50 text-green-800 font-bold py-2 mt-2 rounded-lg hover:bg-green-100 transition-colors">حفظ إعدادات الزر</button>
                    </form>

                    <div className="border border-green-200 p-3 rounded-lg space-y-3">
                        <h4 className="font-semibold text-green-800">{editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</h4>
                        <input type="text" value={adText} onChange={e => setAdText(e.target.value)} placeholder="نص الإعلان" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 transition" />
                        <input type="url" value={adLink} onChange={e => setAdLink(e.target.value)} placeholder="رابط الإعلان (عند الضغط)" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 transition" dir="ltr" />
                        <input type="file" id="ad-image-form" accept="image/*" onChange={e => setAdImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200" />
                        {adImagePreview && <img src={adImagePreview} alt="preview" className="w-20 h-auto object-cover rounded-md border" />}
                        <div className="flex space-x-2 space-x-reverse">
                            <button onClick={handleAddOrUpdateAd} className="flex-grow bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">{editingAd ? 'حفظ التعديلات' : 'إضافة الإعلان'}</button>
                            {editingAd && <button onClick={resetAdForm} type="button" className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">إلغاء</button>}
                        </div>
                    </div>
                    
                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                        {localAds.map(ad => (
                            <div key={ad.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                <span className="text-sm text-gray-800">{ad.text}</span>
                                <div className="flex space-x-2 space-x-reverse">
                                    <button onClick={() => handleStartEdit(ad)} className="text-xs font-semibold text-blue-600">تعديل</button>
                                    <button onClick={() => handleDeleteAd(ad.id)} className="text-xs font-semibold text-red-600">حذف</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             
            {/* Live Feedback Section */}
            <div className="pt-6 border-t-2 border-dashed border-gray-200">
                <h3 className="text-xl font-bold text-center text-blue-700 mb-3">المزامنة المباشرة لآراء الزوار</h3>
                 <p className="text-gray-600 text-sm mb-4 text-center">
                    لجعل آراء الزوار تظهر للجميع فور إضافتها، يرجى إعداد Gist منفصل وآمن.
                    <button onClick={() => setShowInstructions(!showInstructions)} className="text-blue-600 hover:underline font-semibold mr-2">
                        ({showInstructions ? 'إخفاء التعليمات' : 'عرض التعليمات التفصيلية'})
                    </button>
                </p>
                
                {showInstructions && (
                    <div className="text-right bg-blue-50 p-4 rounded-lg mb-4 text-sm text-gray-700 space-y-3 animate-fade-in-fast">
                        <h4 className="font-bold text-blue-800">خطوات إنشاء الرمز (Token) الصحيح:</h4>
                        <ol className="list-decimal list-inside space-y-2">
                            <li>اذهب إلى <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">صفحة إنشاء رمز جديد في GitHub</a>.</li>
                            <li>اختر `Tokens (classic)` من القائمة الجانبية إذا طُلب منك.</li>
                            <li>في خانة "Note"، اكتب اسماً للرمز (مثال: `JanaKids Feedback`).</li>
                            <li>في "Expiration"، اختر `No expiration` ليعمل الرمز دائماً.</li>
                            <li>في قسم "Select scopes"، **يجب أن تختار مربع `gist` فقط**. هذا سيعطيه صلاحية القراءة والكتابة الكاملة.</li>
                            <li>
                                <img src="https://i.imgur.com/g05Zf6x.png" alt="GitHub scope selection for Gist" className="my-2 border rounded-md shadow-sm" />
                            </li>
                            <li>اضغط على زر "Generate token" الأخضر في الأسفل.</li>
                            <li>**مهم جداً:** انسخ الرمز الذي يظهر لك فوراً واحفظه. لن تتمكن من رؤيته مرة أخرى.</li>
                            <li>ألصق هذا الرمز في حقل "GitHub Token" أدناه.</li>
                        </ol>
                        <h4 className="font-bold text-blue-800 mt-3">خطوات إنشاء الـ Gist:</h4>
                         <ol className="list-decimal list-inside space-y-2">
                             <li>اذهب إلى <a href="https://gist.github.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">GitHub Gist</a>.</li>
                             <li>في خانة "Filename including extension..."، اكتب بالضبط: `jana_kids_feedback.json`</li>
                             <li>في مربع المحتوى، اكتب فقط: `[]`</li>
                             <li>اضغط على زر `Create public gist` ليكون قابلاً للقراءة من قبل الزوار.</li>
                             <li>بعد الإنشاء، اضغط على زر "Raw" وانسخ الرابط من شريط العنوان، ثم ألصقه في حقل "رابط Gist" أدناه.</li>
                        </ol>
                    </div>
                )}

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
                    
                    {feedbackTestStatus !== 'idle' && (
                        <div className={`mt-3 p-3 rounded-md text-sm text-center font-semibold ${
                            feedbackTestStatus === 'testing' ? 'bg-gray-100 text-gray-700' :
                            feedbackTestStatus === 'success' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {feedbackTestStatus === 'testing' && 'جاري اختبار الاتصال...'}
                            {feedbackTestStatus === 'success' && 'تم الربط بنجاح! الإعدادات حُفظت.'}
                            {feedbackTestStatus === 'error' && (
                                <>
                                    <strong className="block">فشل الاتصال:</strong>
                                    <p className="font-normal mt-1">{feedbackTestError}</p>
                                </>
                            )}
                        </div>
                    )}

                    <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg text-lg disabled:bg-blue-300" disabled={feedbackTestStatus === 'testing'}>
                        {feedbackTestStatus === 'testing' ? 'جاري الاختبار...' : 'حفظ واختبار ربط الآراء'}
                    </button>
                </form>
            </div>
            
            {/* Visitor Feedback Display */}
            <div className="pt-6 border-t-2 border-dashed border-gray-200">
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
            
             {/* Data Management & Main Sync */}
            <form onSubmit={handleSyncSubmit} className="space-y-4 pt-6 border-t-2 border-dashed border-gray-200">
                <h3 className="text-xl font-bold text-center text-purple-700 mb-3">مزامنة المحتوى الرئيسي وإدارة البيانات</h3>
                 <p className="text-gray-600 text-sm mb-4 text-center">
                    هذا القسم للمحتوى الأساسي (فيديوهات، قوائم، إلخ). مصدر البيانات محدد في الكود.
                </p>
                <div>
                    <label htmlFor="github-token" className="block text-right text-gray-700 font-semibold mb-1">GitHub Personal Access Token (للمحتوى الرئيسي)</label>
                    <input id="github-token" type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition" dir="ltr" autoComplete="new-password" />
                </div>
                {mainSyncStatus !== 'idle' && (
                    <div className={`mt-3 p-3 rounded-md text-sm text-center font-semibold ${
                        mainSyncStatus === 'testing' ? 'bg-gray-100 text-gray-700' :
                        mainSyncStatus === 'success' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {mainSyncStatus === 'testing' && 'جاري اختبار الاتصال...'}
                        {mainSyncStatus === 'success' && 'تم الربط بنجاح! الإعدادات حُفظت.'}
                        {mainSyncStatus === 'error' && `فشل الاتصال: ${mainSyncError}`}
                    </div>
                )}
                 <button 
                    type="submit" 
                    className="w-full bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors duration-300 shadow-lg text-md disabled:bg-purple-300 disabled:cursor-not-allowed"
                    disabled={mainSyncStatus === 'testing'}
                >
                    {mainSyncStatus === 'testing' ? '...جاري الربط' : 'حفظ واختبار المزامنة الرئيسية'}
                </button>
                <div className="grid grid-cols-2 gap-4 pt-4">
                    <button type="button" onClick={onExportData} className="bg-gray-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors">تصدير البيانات (نسخ احتياطي)</button>
                    <button type="button" onClick={handleImportClick} className="bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">استيراد البيانات</button>
                    <input type="file" ref={importFileInputRef} onChange={handleFileImport} className="hidden" accept=".json" />
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;