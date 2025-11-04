import React, { useState, useEffect } from 'react';

interface GistSyncSettings {
    gistUrl: string;
    githubToken: string;
}

interface AdminSettingsProps {
    onCredentialsChange: (credentials: { username: string, password: string }) => void;
    currentCredentials: { username: string, password: string };
    onSyncSettingsChange: (settings: GistSyncSettings) => void;
    currentSyncSettings: GistSyncSettings;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onCredentialsChange, currentCredentials, onSyncSettingsChange, currentSyncSettings }) => {
    const [username, setUsername] = useState(currentCredentials.username);
    const [password, setPassword] = useState(currentCredentials.password);
    const [gistUrl, setGistUrl] = useState('');
    const [githubToken, setGithubToken] = useState('');

    useEffect(() => {
        setGistUrl(currentSyncSettings.gistUrl || '');
        setGithubToken(currentSyncSettings.githubToken || '');
    }, [currentSyncSettings]);

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

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
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
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300 shadow-lg text-lg"
                    >
                        حفظ بيانات الدخول
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
                        <input id="gist-url" type="url" value={gistUrl} onChange={(e) => setGistUrl(e.target.value)} placeholder="https://gist.githubusercontent.com/user/123.../raw/data.json" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition" dir="ltr" />
                    </div>
                    <div>
                        <label htmlFor="github-token" className="block text-right text-gray-700 font-semibold mb-1">GitHub Personal Access Token</label>
                        <input id="github-token" type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition" dir="ltr" />
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
