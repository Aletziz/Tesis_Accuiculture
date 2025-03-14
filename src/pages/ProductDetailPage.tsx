import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Product } from '../types/Product';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  useEffect(() => {
    if (id) {
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [id]);
  
  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
    }
  };
  
  if (!product) {
    return (
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-gray-600 mb-4">Producto no encontrado</p>
          <Link 
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Volver a la tienda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-6">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Volver a la tienda
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/2">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-96 w-full object-cover md:h-full"
              />
            </div>
            <div className="p-8 md:w-1/2">
              <div className="uppercase tracking-wide text-sm text-primary-600 font-semibold">
                {product.category}
              </div>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
              
              <div className="flex items-center mt-4">
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
              
              <div className="mt-4">
                <span className="text-3xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
                <p className="mt-1 text-sm text-gray-500">{product.stock} en stock</p>
              </div>
              
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">Descripción</h2>
                <p className="mt-2 text-gray-600">{product.description}</p>
              </div>
              
              <div className="mt-8">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1 text-gray-600 hover:text-primary-600"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-gray-800">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                      className="px-3 py-1 text-gray-600 hover:text-primary-600"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Añadir al Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}