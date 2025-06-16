// src/stores/authStore.ts
import { useApiMutation } from '@/hooks/use-api';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'entreprise';
  phone: string;
  country: string;
  companyName?: string;
  taxId?: string;
  firstName?: string;
  lastName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (userData: RegisterPayload) => Promise<void>;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  role: 'client' | 'entreprise';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxId?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { mutateAsync: registerUser } = useApiMutation.getState();
          const response = await registerUser('/register', userData);

          if (response.success && response.data) {
            set({
              user: {
                id: response.data.id,
                email: response.data.email,
                name: response.data.name,
                role: response.data.role,
                phone: response.data.phone,
                country: response.data.country,
                ...(response.data.role === 'entreprise' && {
                  companyName: response.data.companyName,
                  taxId: response.data.taxId,
                }),
                ...(response.data.role === 'client' && {
                  firstName: response.data.firstName,
                  lastName: response.data.lastName,
                }),
              },
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Échec de l\'inscription');
          }
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const { mutateAsync: loginUser } = useApiMutation.getState();
          const response = await loginUser('/login', { email, password, rememberMe });

          if (response.success && response.data) {
            set({
              user: {
                id: response.data.user.id,
                email: response.data.user.email,
                name: response.data.user.name,
                role: response.data.user.role,
                phone: response.data.user.phone || '',
                country: response.data.user.country || '',
                ...(response.data.user.role === 'entreprise' && {
                  companyName: response.data.user.companyName,
                  taxId: response.data.user.taxId,
                }),
              },
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Échec de la connexion');
          }
        } catch (error: any) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);