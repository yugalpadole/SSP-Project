import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Shop, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  shop: Shop | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ user: User; shop: Shop | null }>;
  register: (data: any) => Promise<{ user: User; shop: Shop | null }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateShop: (shopData: Partial<Shop>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUserStr = localStorage.getItem('ebazaar_user');
        const savedShopStr = localStorage.getItem('ebazaar_shop');
        if (savedUserStr) {
          const parsedUser = JSON.parse(savedUserStr);

          // Verify and sync latest state from backend database
          const res = await fetch(`/api/auth/me?userId=${parsedUser.id}`, {
            headers: { 'x-user-id': String(parsedUser.id) },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('ebazaar_user', JSON.stringify(data.user));
            }
            if (data.shop) {
              setShop(data.shop);
              localStorage.setItem('ebazaar_shop', JSON.stringify(data.shop));
            } else {
              setShop(null);
              localStorage.removeItem('ebazaar_shop');
            }
          } else {
            // Invalid or deleted user session — clear it immediately!
            setUser(null);
            setShop(null);
            localStorage.removeItem('ebazaar_user');
            localStorage.removeItem('ebazaar_shop');
          }
        }
      } catch (e) {
        console.error('Failed to sync auth session', e);
        setUser(null);
        setShop(null);
        localStorage.removeItem('ebazaar_user');
        localStorage.removeItem('ebazaar_shop');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.error || 'Failed to login') as any;
      err.roleMismatch = data.roleMismatch;
      err.actualRole = data.actualRole;
      err.expectedRole = data.expectedRole;
      throw err;
    }

    // Client-side role validation guard
    if (role && data.user && data.user.role !== role) {
      const err = new Error(`This account is registered as a ${data.user.role}. Please switch tabs to sign in.`) as any;
      err.roleMismatch = true;
      err.actualRole = data.user.role;
      throw err;
    }

    setUser(data.user);
    setShop(data.shop || null);
    localStorage.setItem('ebazaar_user', JSON.stringify(data.user));
    if (data.shop) {
      localStorage.setItem('ebazaar_shop', JSON.stringify(data.shop));
    } else {
      localStorage.removeItem('ebazaar_shop');
    }

    return data;
  };

  const register = async (formData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }

    setUser(data.user);
    setShop(data.shop || null);
    localStorage.setItem('ebazaar_user', JSON.stringify(data.user));
    if (data.shop) {
      localStorage.setItem('ebazaar_shop', JSON.stringify(data.shop));
    } else {
      localStorage.removeItem('ebazaar_shop');
    }

    return data;
  };

  const logout = () => {
    setUser(null);
    setShop(null);
    localStorage.removeItem('ebazaar_user');
    localStorage.removeItem('ebazaar_shop');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('ebazaar_user', JSON.stringify(updated));
  };

  const updateShop = (shopData: Partial<Shop>) => {
    if (!shop) return;
    const updated = { ...shop, ...shopData };
    setShop(updated);
    localStorage.setItem('ebazaar_shop', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        role: user ? user.role : null,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        updateShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
