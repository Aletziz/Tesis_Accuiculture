import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Pedido Completado!</h1>
          <p className="text-gray-600 mb-6">
            Gracias por tu compra. Hemos recibido tu pedido y lo estamos procesando.
            Recibirás un correo electrónico con los detalles de tu compra.
          </p>
          <div className="mt-8">
            <Link 
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Continuar comprando
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}