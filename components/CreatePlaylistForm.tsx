
import React, { useState } from 'react';

interface CreatePlaylistFormProps {
  onCreatePlaylist: (name: string) => void;
}

const CreatePlaylistForm: React.FC<CreatePlaylistFormProps> = ({ onCreatePlaylist }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('الرجاء إدخال اسم لقائمة التشغيل');
      return;
    }
    onCreatePlaylist(name);
    setName('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-pink-600 mb-6">إنشاء قائمة تشغيل جديدة</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playlist-name" className="block text-right text-gray-700 font-semibold mb-1">
            اسم القائمة
          </label>
          <input
            id="playlist-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: قصص الحيوانات"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-pink-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-600 transition-colors duration-300 shadow-lg text-lg"
        >
          إنشاء القائمة
        </button>
      </form>
    </div>
  );
};

export default CreatePlaylistForm;
