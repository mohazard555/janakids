import React from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  return (
    <div className="relative w-full mr-4">
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="ابحث عما تريد يا طفل الصغير..."
        className="w-full px-5 py-3 pr-12 text-lg text-gray-700 bg-white border-2 border-sky-200 rounded-full focus:ring-4 focus:ring-sky-300 focus:border-sky-500 transition-all shadow-sm"
        aria-label="Search for videos"
      />
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-sky-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;
