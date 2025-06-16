import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/api/api';
import { useApiStore } from '@/stores/api.store';

// Hook pour les requêtes GET
export const useApiQuery = <T>(key: string[], url: string, options = {}) => {
  const { setLoading, setError } = useApiStore();

  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(url);
        return response.data;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    ...options,
  });
};

// Hook pour les mutations (POST, PUT, DELETE)
export const useApiMutation = <T, V>(url: string, method = 'post') => {
  const { setLoading, setError } = useApiStore();

  return useMutation<T, Error, V>({
    mutationFn: async (data) => {
      try {
        setLoading(true);
        const response = await apiClient({
          method,
          url,
          data,
        });
        return response.data;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
};