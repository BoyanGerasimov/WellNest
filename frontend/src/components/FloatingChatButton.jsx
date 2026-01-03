import { useState } from 'react';
import ChatModal from './ChatModal';

const FloatingChatButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl hover:shadow-teal-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Open AI Chat Coach"
      >
        <svg
          className={`w-7 h-7 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {isHovered && (
          <span className="absolute -top-12 right-0 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
            AI Chat Coach
          </span>
        )}
      </button>
      <ChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default FloatingChatButton;

