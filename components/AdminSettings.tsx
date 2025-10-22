import React, { useState } from 'react';

interface AdminSettingsProps {
    onCredentialsChange: (credentials: { username: string, password: string }) => void;
    currentCredentials: { username: string, password: string };
    onExportData: () => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onCredentialsChange, currentCredentials, onExportData }) => {
    const [username, setUsername] = useState(currentCredentials.username);
    const [password, setPassword] = useState(currentCredentials.password);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            alert('لا يمكن ترك اسم المستخدم أو كلمة المرور فارغة');
            return;
        }
        onCredentialsChange({ username, password });
        alert('تم تحديث معلومات تسجيل الدخول بنجاح!');
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
            <div className="flex-grow">
                <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">إعدادات الأدمن</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        حفظ الإعدادات
                    </button>
                </form>
            </div>
            
            <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-200">
                <h3 className="text-xl font-bold text-center text-sky-700 mb-3">نشر التغييرات للجميع</h3>
                <p className="text-gray-600 text-center text-sm mb-4">
                    لجعل المحتوى الجديد ظاهرًا لجميع الزوار، قم بتصدير البيانات وتحديث ملف 
                    <code className="bg-gray-200 text-xs px-1 rounded mx-1">data.ts</code>
                    في كود المشروع.
                </p>
                <button
                    onClick={onExportData}
                    className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-lg text-md"
                >
                    تصدير ملف البيانات
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;