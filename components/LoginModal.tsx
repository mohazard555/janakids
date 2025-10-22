import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (username: string, pass: string) => boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-sky-600">تسجيل دخول الأدمن</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-right text-gray-700 font-semibold mb-2">اسم المستخدم</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-right text-gray-700 font-semibold mb-2">كلمة المرور</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          <button
            type="submit"
            className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-lg text-lg"
          >
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
