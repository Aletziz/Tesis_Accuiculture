import React from 'react';

interface CartCounterProps {
  count: number;
}

export function CartCounter({ count }: CartCounterProps) {
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
      {count}
    </span>
  );
}