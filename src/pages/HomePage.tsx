import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { Footer } from '../components/Footer';
import { products } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types/Product';

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const { user } = useAuth();

  const categories = Array.from(new Set(products.map(p => p.category)));

  useEffect(() => {
    let result = products;
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset category when searching
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />
      <Hero />
      
      {user && (
        <div className="max-w-7xl mx-auto px-4 py-6 bg-primary-50 mt-6 rounded-lg">
          <h2 className="text-2xl font-bold text-primary-800">¡Bienvenido de nuevo, {user.name}!</h2>
          <p className="text-primary-600">
            {user.isAdmin 
              ? 'Tienes acceso de administrador para gestionar productos y pedidos.' 
              : 'Gracias por comprar con nosotros.'}
          </p>
        </div>
      )}
      
      <FeaturedProducts products={products} />
      
      <main className="max-w-7xl mx-auto px-4 py-12" id="products">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nuestros Productos</h2>
          
          {searchQuery && (
            <div className="mb-4 p-4 bg-primary-50 rounded-lg">
              <p className="text-primary-800">
                Resultados para: <span className="font-semibold">"{searchQuery}"</span>
                {' '}
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-primary-600 hover:text-primary-800 underline ml-2"
                >
                  Limpiar búsqueda
                </button>
              </p>
            </div>
          )}
          
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 mb-4">No se encontraron productos que coincidan con tu búsqueda.</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}