import React, { useState } from 'react';

interface AddVideoFormProps {
  onAddVideo: (video: { title: string; youtubeUrl: string }) => void;
}

const AddVideoForm: React.FC<AddVideoFormProps> = ({ onAddVideo }) => {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }
    onAddVideo({ title, youtubeUrl });
    setTitle('');
    setYoutubeUrl('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mb-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-sky-600 mb-6">أضف فيديو جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-right text-gray-700 font-semibold mb-1">عنوان الفيديو</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: قصة الأرنب الشجاع"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
          />
        </div>
        <div>
          <label htmlFor="youtubeUrl" className="block text-right text-gray-700 font-semibold mb-1">رابط الفيديو على يوتيوب</label>
          <input
            id="youtubeUrl"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 transition-colors duration-300 shadow-lg text-lg"
        >
          إضافة الفيديو
        </button>
      </form>
    </div>
  );
};

export default AddVideoForm;