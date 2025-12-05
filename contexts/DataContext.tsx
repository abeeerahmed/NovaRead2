import React, { createContext, useContext, useState } from 'react';
import { UserRole, Novel, Chapter, Review, Comment, User } from '../types';

interface AppContextType {
  user: User | null;
  isLoadingAuth: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  novels: Novel[];
  latestNovels: Novel[];
  popularNovels: Novel[];
  isLoadingData: boolean;
  fetchNovelDetails: (id: string) => Promise<any>;
  fetchChapter: (id: string) => Promise<any>;
  addNovel: (data: any) => Promise<void>;
  updateNovel: (id: string, data: any) => Promise<void>;
  deleteNovel: (id: string) => Promise<void>;
  addChapter: (data: any) => Promise<void>;
  updateChapter: (id: string, data: any) => Promise<void>;
  deleteChapter: (id: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  updateUserRole: (id: string, role: UserRole) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  banUser: (id: string) => Promise<void>;
  updateProgress: (data: any) => Promise<void>;
  notifications: any[];
  dismissNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = (msg: string, type: string) => {
    const id = Math.random().toString();
    setNotifications(p => [...p, { id, message: msg, type }]);
    setTimeout(() => dismissNotification(id), 3000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(p => p.filter(n => n.id !== id));
  };

  const value: AppContextType = {
    user,
    isLoadingAuth,
    login: async () => addNotification('Logged in', 'success'),
    register: async () => addNotification('Registered', 'success'),
    logout: () => { setUser(null); addNotification('Logged out', 'info'); },
    theme,
    toggleTheme: () => setTheme(p => p === 'dark' ? 'light' : 'dark'),
    novels,
    latestNovels: novels,
    popularNovels: novels,
    isLoadingData: false,
    fetchNovelDetails: async () => null,
    fetchChapter: async () => null,
    addNovel: async () => addNotification('Novel added', 'success'),
    updateNovel: async () => addNotification('Updated', 'success'),
    deleteNovel: async () => addNotification('Deleted', 'success'),
    addChapter: async () => addNotification('Chapter added', 'success'),
    updateChapter: async () => addNotification('Chapter updated', 'success'),
    deleteChapter: async () => addNotification('Chapter deleted', 'success'),
    getAllUsers: async () => [],
    updateUserRole: async () => addNotification('Role updated', 'success'),
    deleteUser: async () => addNotification('User deleted', 'success'),
    banUser: async () => addNotification('User banned', 'success'),
    updateProgress: async () => {},
    notifications,
    dismissNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppProvider;
