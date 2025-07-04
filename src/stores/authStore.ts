// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserRole = 'client' | 'entreprise' | 'employee';

interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  phone?: string;
  country?: string;
}

interface ClientUser extends BaseUser {
  role: 'client';
  firstName: string;
  lastName: string;
}

interface EntrepriseUser extends BaseUser {
  role: 'entreprise';
  companyName: string;
  taxId?: string;
}

interface EmployeeUser extends BaseUser {
  role: 'employee';
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  companyId: string;
  companyName?: string;
}

type User = ClientUser | EntrepriseUser | EmployeeUser;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuthData: (user: User, token: string) => void;
  clearAuthData: () => void;
  updateUser: (partialUser: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Définit les données d'authentification
      setAuthData: (user, token) => {
        set({ 
          user,
          token,
          isAuthenticated: true 
        });
      },

      // Réinitialise l'état d'authentification
      clearAuthData: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      // Met à jour partiellement les données utilisateur
      updateUser: (partialUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Ne persister que les données essentielles
      partialize: (state) => ({
        token: state.token,
        user: state.user
      }),
    }
  )
);