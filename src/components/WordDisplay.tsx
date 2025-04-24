import React from 'react';

interface WordDisplayProps {
  word: string;
}

export function WordDisplay({ word }: WordDisplayProps) {
  return (
    <div className="text-4xl font-bold text-indigo-600 mb-4">
      {word}
    </div>
  );
}