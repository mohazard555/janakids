import React from 'react';
import type { Feedback } from '../types';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
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
};

interface FeedbackPanelProps {
    feedback: Feedback[];
    onClose: () => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, onClose }) => {
    const sortedFeedback = [...(feedback || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
            <div className="p-4 border-b flex justify-between items-center bg-yellow-50">
                <h3 className="font-bold text-yellow-800">⭐ آراء الزوار</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {sortedFeedback.length > 0 ? (
                    <ul>
                        {sortedFeedback.map(item => (
                            <li key={item.id} className="p-3 border-b last:border-b-0">
                                <div className="flex items-center justify-between mb-2">
                                    <StarRating rating={item.rating} />
                                    <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <p className="text-sm text-gray-700">"{item.comment}"</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="p-4 text-center text-gray-500">لا توجد آراء بعد. كن أول من يشاركنا رأيك!</p>
                )}
            </div>
        </div>
    );
};

export default FeedbackPanel;
