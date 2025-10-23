import React, { useState } from 'react';

interface AddActivityFormProps {
  onAddActivity: (activity: { title: string; description: string; imageFile: File }) => void;
}

const AddActivityForm: React.FC<AddActivityFormProps> = ({ onAddActivity }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageFile) {
      alert('الرجاء إدخال العنوان واختيار صورة للنشاط.');
      return;
    }
    onAddActivity({ title, description, imageFile });
    setTitle('');
    setDescription('');
    setImageFile(null);
    // Clear the file input visually
    const fileInput = e.target as HTMLFormElement;
    fileInput.reset();
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-center text-green-600 mb-6">أضف نشاط جديد</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="activity-title" className="block text-right text-gray-700 font-semibold mb-1">عنوان النشاط</label>
          <input
            id="activity-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: ورقة تلوين الأسد"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition"
          />
        </div>
        <div>
          <label htmlFor="activity-description" className="block text-right text-gray-700 font-semibold mb-1">وصف النشاط (اختياري)</label>
          <textarea
            id="activity-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: قم بتلوين هذا الأسد الشجاع بألوانك المفضلة!"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 transition resize-none"
          />
        </div>
        <div>
          <label htmlFor="activity-image" className="block text-right text-gray-700 font-semibold mb-1">صورة النشاط (للطباعة)</label>
          <input
            id="activity-image"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 shadow-lg text-lg"
        >
          إضافة النشاط
        </button>
      </form>
    </div>
  );
};

export default AddActivityForm;
