import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('fittrack_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          localStorage.removeItem('fittrack_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('fittrack_token', res.data.token);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    localStorage.setItem('fittrack_token', res.data.token);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('fittrack_token');
    setUser(null);
  };

  const updateProfileState = (updatedProfile) => {
    setUser((prev) => prev ? { ...prev, profile: { ...prev.profile, ...updatedProfile } } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        updateProfileState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
