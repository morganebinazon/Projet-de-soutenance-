import { create } from 'zustand';

interface ApiStoreState {
  apiLoading: boolean;
  apiError: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useApiStore = create<ApiStoreState>((set) => ({
  apiLoading: false,
  apiError: null,
  setLoading: (apiLoading) => set({ apiLoading }),
  setError: (apiError) => set({ apiError }),
  reset: () => set({ apiLoading: false, apiError: null }),
}));