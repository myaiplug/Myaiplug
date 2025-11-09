'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, userApi } from '../services/api';
import type { User, Profile, Badge } from '../types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, handle: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: {
    handle?: string;
    bio?: string;
    avatarUrl?: string;
    privacyOptOut?: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await authApi.checkSession();
      
      if (response) {
        setState({
          user: {
            id: response.user.id,
            email: response.user.email,
            handle: response.user.handle,
            avatarUrl: response.user.avatarUrl,
            bio: response.user.bio,
            tier: response.user.tier as any,
            emailVerifiedAt: null,
            passwordHash: '',
            ipHash: '',
            createdAt: new Date(),
          },
          profile: {
            userId: response.user.id,
            level: response.profile.level,
            pointsTotal: response.profile.pointsTotal,
            timeSavedSecTotal: response.profile.timeSavedSecTotal,
            badges: response.profile.badges,
            privacyOptOut: response.profile.privacyOptOut,
          },
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setState({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const signin = async (email: string, password: string) => {
    const response = await authApi.signin(email, password);
    
    setState({
      user: {
        id: response.user.id,
        email: response.user.email,
        handle: response.user.handle,
        avatarUrl: response.user.avatarUrl,
        bio: response.user.bio,
        tier: response.user.tier as any,
        emailVerifiedAt: null,
        passwordHash: '',
        ipHash: '',
        createdAt: new Date(),
      },
      profile: {
        userId: response.user.id,
        level: response.profile.level,
        pointsTotal: response.profile.pointsTotal,
        timeSavedSecTotal: response.profile.timeSavedSecTotal,
        badges: response.profile.badges,
        privacyOptOut: false,
      },
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const signup = async (email: string, password: string, handle: string) => {
    const response = await authApi.signup(email, password, handle);
    
    setState({
      user: {
        id: response.user.id,
        email: response.user.email,
        handle: response.user.handle,
        avatarUrl: response.user.avatarUrl,
        bio: response.user.bio,
        tier: response.user.tier as any,
        emailVerifiedAt: null,
        passwordHash: '',
        ipHash: '',
        createdAt: new Date(),
      },
      profile: {
        userId: response.user.id,
        level: response.profile.level,
        pointsTotal: response.profile.pointsTotal,
        timeSavedSecTotal: response.profile.timeSavedSecTotal,
        badges: response.profile.badges,
        privacyOptOut: false,
      },
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    await authApi.logout();
    setState({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const refreshProfile = useCallback(async () => {
    try {
      const response = await userApi.getProfile();
      
      setState(prev => ({
        ...prev,
        user: {
          id: response.user.id,
          email: response.user.email,
          handle: response.user.handle,
          avatarUrl: response.user.avatarUrl,
          bio: response.user.bio,
          tier: response.user.tier as any,
          emailVerifiedAt: null,
          passwordHash: '',
          ipHash: '',
          createdAt: new Date(),
        },
        profile: {
          userId: response.user.id,
          level: response.profile.level,
          pointsTotal: response.profile.pointsTotal,
          timeSavedSecTotal: response.profile.timeSavedSecTotal,
          badges: response.profile.badges,
          privacyOptOut: response.profile.privacyOptOut,
        },
      }));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, []);

  const updateProfile = async (updates: {
    handle?: string;
    bio?: string;
    avatarUrl?: string;
    privacyOptOut?: boolean;
  }) => {
    const response = await userApi.updateProfile(updates);
    
    setState(prev => ({
      ...prev,
      user: prev.user ? {
        ...prev.user,
        handle: response.user.handle,
        bio: response.user.bio,
        avatarUrl: response.user.avatarUrl,
      } : null,
      profile: prev.profile ? {
        ...prev.profile,
        privacyOptOut: response.profile.privacyOptOut,
      } : null,
    }));
  };

  const value: AuthContextValue = {
    ...state,
    signin,
    signup,
    logout,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
