import React, { useState } from 'react';

interface AddShortsFormProps {
  onAddShort: (short: { title: string; youtubeUrl: string }) => void;
}

const AddShortsForm: React.FC<AddShortsFormProps> = ({ onAddShort }) => {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }
    onAddShort({ title, youtubeUrl });
    setTitle('');
    setYoutubeUrl('');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">أضف فيديو قصير (شورت)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="short-title" className="block text-right text-gray-700 font-semibold mb-1">عنوان الشورت</label>
          <input
            id="short-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: تحدي ممتع"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
          />
        </div>
        <div>
          <label htmlFor="short-youtubeUrl" className="block text-right text-gray-700 font-semibold mb-1">رابط الشورت على يوتيوب</label>
          <input
            id="short-youtubeUrl"
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/shorts/..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors duration-300 shadow-lg text-lg"
        >
          إضافة الشورت
        </button>
      </form>
    </div>
  );
};

export default AddShortsForm;
