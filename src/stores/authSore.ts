import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'entreprise';
  company?: string;
  phone: string;
  country: string;
  password: string; // Stockage simulé
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  users: User[]; // Liste de tous les utilisateurs
  register: (userData: Omit<User, 'id'>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      users: [], // Initialisé vide

      register: async (userData) => {
        const { users } = get();
        
        // Vérification case-insensitive et sans espaces
        const emailExists = users.some(
          u => u.email.toLowerCase().trim() === userData.email.toLowerCase().trim()
        );
        console.log('Email exists:', emailExists);
        if (emailExists) {
          throw new Error('Un utilisateur avec cet email existe déjà');
        }

        const newUser = {
          ...userData,
          id: Date.now().toString(),
        };

        set({
          users: [...users, newUser],
          user: newUser,
          token: 'simulated-jwt-token',
          isAuthenticated: true
        });
      },

      login: async (email, password) => {
        const { users } = get();
        const user = users.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
          throw new Error('Email ou mot de passe incorrect');
        }

        set({
          user,
          token: 'simulated-jwt-token',
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);