import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);

  // Initialize auth state from localStorage on mount
  React.useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      // Fetch user profile if token exists
      fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setUser(data);
          } else {
            // Token is invalid, clear it
            clearAuth();
          }
        })
        .catch(err => {
          console.error('Error fetching user profile:', err);
          clearAuth();
        });
    }
  }, []);

  // Register new user
  const register = useCallback(async (username, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      // Store token and user data
      const newToken = data.token;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error during registration' };
    }
  }, []);

  // Login user
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      // Store token and user data
      const newToken = data.token;
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(data.user);
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error during login' };
    }
  }, []);

  // Logout user
  const logout = useCallback(() => {
    clearAuth();
  }, []);

  // Clear authentication
  const clearAuth = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (bio, avatar) => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, avatar })
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Profile update failed' };
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Network error' };
    }
  }, [token]);

  const value = {
    user,
    isAuthenticated,
    token,
    register,
    login,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use Auth Context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export default AuthContext;
