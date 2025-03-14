import React from 'react';

interface GenerateButtonProps {
  onClick: () => void;
}

export function GenerateButton({ onClick }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 
                 transition-colors duration-200 focus:outline-none focus:ring-2 
                 focus:ring-indigo-500 focus:ring-offset-2"
    >
      Generate Word
    </button>
  );
}