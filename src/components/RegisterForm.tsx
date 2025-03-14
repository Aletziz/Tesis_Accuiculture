import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RegisterData } from '../types/User';
import { Link, useNavigate } from 'react-router-dom';

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await register(formData);
      if (success) {
        navigate('/');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear una nueva cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          O{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            inicia sesión en tu cuenta existente
          </Link>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="name" className="sr-only">Nombre completo</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="sr-only">Confirmar contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
          >
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </div>
      </form>
    </div>
  );
}