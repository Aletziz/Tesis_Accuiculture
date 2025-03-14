import React from 'react';
import { Product } from '../types/Product';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-cover"
          />
        </Link>
        <span className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-lg text-sm">
          {product.category}
        </span>
      </div>
      <div className="p-5">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-primary-600">{product.name}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              {product.stock} en stock
            </p>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}