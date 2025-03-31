// UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount, load the persisted user (if any)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsLoggedOut(false);
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function saves user info in state and AsyncStorage.
  const login = async (userData) => {
    setUser(userData);
    setIsLoggedOut(false);
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user", error);
    }
  };

  // Logout function clears the user info.
  const logout = async () => {
    setUser(null);
    setIsLoggedOut(true);
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error("Failed to remove user", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoggedOut, login, logout, loading }}>
      {loading ? null : children}
    </UserContext.Provider>
  );
};
