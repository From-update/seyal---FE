'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getTokens, setTokens, clearTokens } from './api';
import { translations, Language } from './i18n';

interface AuthContextType {
  user: any | null;
  workspaces: any[];
  currentWorkspace: any | null;
  setCurrentWorkspace: (ws: any) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['en'];
  isLoading: boolean;
  loginUser: (tokens: { access: string; refresh: string }, defaultWsId?: string) => Promise<void>;
  logout: () => void;
  refreshState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<any | null>(null);
  const [lang, setLangState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = translations[lang] || translations.en;

  const setCurrentWorkspace = (ws: any) => {
    setCurrentWorkspaceState(ws);
    if (typeof window !== 'undefined' && ws) {
      localStorage.setItem('seyal_current_ws', JSON.stringify(ws));
    }
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('seyal_lang', newLang);
    }
    if (user) {
      api.updateMe({ language: newLang }).catch(() => {});
    }
  };

  const refreshState = async () => {
    try {
      const { access } = getTokens();
      if (!access) {
        setIsLoading(false);
        return;
      }

      const userData = await api.getMe();
      setUser(userData);
      if (userData.language === 'ta' || userData.language === 'en') {
        setLangState(userData.language);
      }

      const wsList = await api.getWorkspaces();
      setWorkspaces(wsList);

      // Select workspace
      const savedWs = localStorage.getItem('seyal_current_ws');
      let targetWs = null;
      if (savedWs) {
        try {
          const parsed = JSON.parse(savedWs);
          targetWs = wsList.find((w: any) => w.id === parsed.id);
        } catch {}
      }

      if (!targetWs && userData.default_workspace_id) {
        targetWs = wsList.find((w: any) => w.id === userData.default_workspace_id);
      }

      if (!targetWs && wsList.length > 0) {
        targetWs = wsList[0];
      }

      setCurrentWorkspaceState(targetWs);
    } catch (err) {
      console.error('Error refreshing auth state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (tokens: { access: string; refresh: string }, defaultWsId?: string) => {
    setTokens(tokens.access, tokens.refresh);
    await refreshState();
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspaceState(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('seyal_lang') as Language;
    if (savedLang === 'ta' || savedLang === 'en') {
      setLangState(savedLang);
    }
    refreshState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        lang,
        setLang,
        t,
        isLoading,
        loginUser,
        logout,
        refreshState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

