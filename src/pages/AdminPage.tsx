import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/products';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export function AdminPage() {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Añadir Producto
            </button>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenido, {user?.name}</h2>
            <p className="text-gray-600">Tienes acceso de administrador para gestionar la tienda.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="font-semibold text-primary-800 mb-2">Total de Productos</h3>
              <p className="text-3xl font-bold text-primary-600">{products.length}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Total de Pedidos</h3>
              <p className="text-3xl font-bold text-green-600">24</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-2">Total de Clientes</h3>
              <p className="text-3xl font-bold text-purple-600">156</p>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestión de Productos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}