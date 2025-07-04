import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageService, StorageKeys } from '@/utils/storage';
import { apiService } from '@/services/api';

interface User {
  _id: string;
  email: string;
  full_name: string;
  membershipID: string;
  phone_number: string;
  passport_photo_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  sendOTP: (phoneNumber: string) => Promise<{ success: boolean; sessionId?: string }>;
  verifyOTP: (sessionId: string, otp: string) => Promise<{ success: boolean; isNewUser?: boolean }>;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await StorageService.getItem(StorageKeys.AUTH_TOKEN);
      const storedUser = await StorageService.getObject<User>(StorageKeys.USER_DATA);
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        apiService.setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string): Promise<{ success: boolean; sessionId?: string }> => {
    try {
      console.log('Sending OTP to:', phoneNumber);
      const response = await apiService.sendOTP({ phone: phoneNumber });
      console.log('Send OTP response:', response);
      return { success: true, sessionId: response.sessionId };
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false };
    }
  };

  const verifyOTP = async (sessionId: string, otp: string): Promise<{ success: boolean; isNewUser?: boolean }> => {
    try {
      console.log('Verifying OTP with sessionId:', sessionId, 'OTP:', otp);
      const response = await apiService.verifyOTP({ sessionId, otp });
      console.log('Verify OTP response:', response);
      
      if (response.message === "Member not found with this phone number") {
        return { success: true, isNewUser: true };
      }
      
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        apiService.setToken(response.token);
        
        await StorageService.setItem(StorageKeys.AUTH_TOKEN, response.token);
        await StorageService.setObject(StorageKeys.USER_DATA, response.user);
        
        return { success: true, isNewUser: false };
      }
      
      return { success: false };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      // Check if it's a "Member not found" error
      if (error.message && error.message.includes("Member not found")) {
        return { success: true, isNewUser: true };
      }
      
      return { success: false };
    }
  };
   
  const login = async (token: string, userData: User) => {
    try {
      setToken(token);
      setUser(userData);
      apiService.setToken(token);

      await StorageService.setItem(StorageKeys.AUTH_TOKEN, token);
      await StorageService.setObject(StorageKeys.USER_DATA, userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    StorageService.setObject(StorageKeys.USER_DATA, userData);
  };
   
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      apiService.setToken('');
      
      await StorageService.removeItem(StorageKeys.AUTH_TOKEN);
      await StorageService.removeItem(StorageKeys.USER_DATA);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, sendOTP, verifyOTP, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}