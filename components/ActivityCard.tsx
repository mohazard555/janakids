import React from 'react';
import type { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  isAdmin: boolean;
  onDeleteActivity: (activityId: number) => void;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isAdmin, onDeleteActivity }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا النشاط؟')) {
      onDeleteActivity(activity.id);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col group relative">
      {isAdmin && (
        <button
            onClick={handleDelete}
            className="absolute top-3 left-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Delete activity"
        >
            <TrashIcon />
        </button>
      )}
      <div className="w-full aspect-[3/4] bg-gray-100 p-4">
        <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-contain" loading="lazy" />
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
            <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
            {activity.description && <p className="text-gray-600 mt-2 text-sm">{activity.description}</p>}
        </div>
        <a
            href={activity.imageUrl}
            download={`${activity.title.replace(/\s+/g, '_')}.png`}
            className="mt-4 bg-green-500 text-white font-bold py-2 px-6 rounded-full hover:bg-green-600 transition-colors duration-300 shadow-md flex items-center justify-center w-full"
        >
            تحميل للطباعة
            <DownloadIcon />
        </a>
      </div>
    </div>
  );
};

export default ActivityCard;