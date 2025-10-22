import React, { useState } from 'react';
import type { Video } from '../types';

interface EditVideoModalProps {
  video: Video;
  onUpdate: (updatedVideo: { id: number; title: string; youtubeUrl: string }) => void;
  onClose: () => void;
}

const EditVideoModal: React.FC<EditVideoModalProps> = ({ video, onUpdate, onClose }) => {
  const [title, setTitle] = useState(video.title);
  const [youtubeUrl, setYoutubeUrl] = useState(video.youtubeUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) {
      alert('الرجاء ملء جميع الحقول');
      return;
    }
    onUpdate({ id: video.id, title, youtubeUrl });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-95 hover:scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-600">تعديل الفيديو</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="edit-title" className="block text-right text-gray-700 font-semibold mb-2">عنوان الفيديو</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="edit-youtubeUrl" className="block text-right text-gray-700 font-semibold mb-2">رابط الفيديو على يوتيوب</label>
            <input
              id="edit-youtubeUrl"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors duration-300 shadow-lg text-lg"
          >
            حفظ التغييرات
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditVideoModal;
