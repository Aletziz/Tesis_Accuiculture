import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/User';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from a backend
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@polos-sales.com',
    name: 'Administrador',
    password: 'admin123',
    isAdmin: true
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Usuario Regular',
    password: 'user123',
    isAdmin: false
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);

    // Set up Supabase auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session && session.user) {
          const { id, email } = session.user;
          // In a real app, you would fetch additional user data from your database
          setUser({
            id,
            email: email || 'usuario@polos-sales.com',
            name: email?.split('@')[0] || 'Usuario',
            isAdmin: email === 'admin@polos-sales.com'
          });
          localStorage.setItem('user', JSON.stringify({
            id,
            email: email || 'usuario@polos-sales.com',
            name: email?.split('@')[0] || 'Usuario',
            isAdmin: email === 'admin@polos-sales.com'
          }));
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Try Supabase auth first
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        // Fall back to mock users for demo
        const foundUser = MOCK_USERS.find(
          u => u.email === credentials.email && u.password === credentials.password
        );
        
        if (foundUser) {
          // Remove password before storing
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          toast.success(`¡Bienvenido de nuevo, ${foundUser.name}!`);
          return true;
        } else {
          toast.error('Correo electrónico o contraseña inválidos');
          return false;
        }
      }
      
      toast.success('¡Inicio de sesión exitoso!');
      return true;
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Error al iniciar sesión');
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      // Check if passwords match
      if (data.password !== data.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return false;
      }
      
      // Try to register with Supabase
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      });

      if (error) {
        // Check if email already exists in mock users
        if (MOCK_USERS.some(u => u.email === data.email)) {
          toast.error('El correo electrónico ya está en uso');
          return false;
        }
        
        // For demo, simulate successful registration with mock data
        const newUser = {
          id: String(MOCK_USERS.length + 1),
          email: data.email,
          name: data.name,
          isAdmin: false
        };
        
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        toast.success('¡Registro exitoso!');
        return true;
      }
      
      toast.success('¡Registro exitoso! Verifica tu correo electrónico.');
      return true;
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error('Error al registrarse');
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}