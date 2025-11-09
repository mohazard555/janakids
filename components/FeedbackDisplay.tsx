import React from 'react';
import type { Feedback } from '../types';

interface FeedbackDisplayProps {
    feedback: Feedback[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
    const sortedFeedback = [...(feedback || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 border-r-8 border-yellow-500 pr-4">
                آراء الزوار
            </h2>
            {sortedFeedback.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sortedFeedback.slice(0, 6).map(item => ( // Show latest 6
                        <div key={item.id} className="bg-white p-5 rounded-xl shadow-md flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                                <StarRating rating={item.rating} />
                                <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">"{item.comment}"</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white/50 rounded-2xl">
                    <h3 className="text-2xl font-bold text-sky-800">لا توجد آراء بعد</h3>
                    <p className="text-gray-600 mt-2">كن أول من يشاركنا رأيك في القناة!</p>
                </div>
            )}
        </div>
    );
};

export default FeedbackDisplay;
