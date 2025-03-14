import React, { useState } from 'react';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartModal } from './CartModal';
import { Link, useNavigate } from 'react-router-dom';

export function Header({ onSearch }: { onSearch?: (query: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <h1 className="text-3xl font-bold text-primary-600">Polo's Sales</h1>
            </Link>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="pl-10 pr-4 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute left-3 top-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-primary-400" />
              </button>
            </form>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Hola, <span className="font-semibold">{user?.name}</span>
                </div>
                {user?.isAdmin && (
                  <Link to="/admin" className="text-sm text-primary-600 hover:text-primary-800">
                    Panel Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center text-gray-600 hover:text-primary-600">
                <UserIcon className="h-6 w-6 mr-1" />
                <span>Iniciar sesión</span>
              </Link>
            )}
            <button 
              className="relative p-2"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCartIcon className="h-6 w-6 text-gray-600 hover:text-primary-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}