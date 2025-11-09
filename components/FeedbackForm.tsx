import React, { useState } from 'react';

interface FeedbackFormProps {
    onAddFeedback: (rating: number, comment: string) => void;
}

const StarIcon: React.FC<{ filled: boolean; onMouseEnter: () => void; onClick: () => void; }> = ({ filled, onMouseEnter, onClick }) => (
    <svg 
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        className={`w-8 h-8 cursor-pointer transition-transform duration-200 hover:scale-125 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onAddFeedback }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('الرجاء اختيار تقييم (عدد النجوم)');
            return;
        }
        if (!comment.trim()) {
            alert('الرجاء كتابة تعليق');
            return;
        }
        onAddFeedback(rating, comment);
        setSubmitted(true);
        // Reset form after a delay
        setTimeout(() => {
            setRating(0);
            setHoverRating(0);
            setComment('');
            setSubmitted(false);
        }, 5000);
    };
    
    if (submitted) {
        return (
            <div className="mt-4 text-center bg-green-100 text-green-800 p-4 rounded-lg animate-fade-in w-full">
                <h4 className="font-bold text-lg">شكراً لك!</h4>
                <p>تم استلام رأيك بنجاح.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 text-center w-full">
            <h4 className="font-bold text-pink-100 text-lg">ما هو رأيك في القناة؟</h4>
            <form onSubmit={handleSubmit} className="mt-2 space-y-3">
                <div className="flex justify-center" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon 
                            key={star} 
                            filled={hoverRating >= star || rating >= star}
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="اكتب تعليقك هنا..."
                    className="w-full bg-white/30 text-white placeholder-pink-100 p-2 rounded-lg border-2 border-transparent focus:border-white focus:bg-white/40 outline-none transition-all resize-none text-sm"
                    rows={2}
                    aria-label="Your comment"
                />
                <button
                    type="submit"
                    className="w-full bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition-colors shadow-md text-sm"
                >
                    إرسال الرأي
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;
