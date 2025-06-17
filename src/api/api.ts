import axios from 'axios';
// import { getCountryCode } from '@/hooks/use-country'; // Adaptez selon votre implémentation

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://votre-api.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'fr-FR', // Langue par défaut
  },
});

// Intercepteur pour ajouter le pays sélectionné
apiClient.interceptors.request.use((config) => {
  // const countryCode = getCountryCode(); // Utilisez votre hook country
  // if (countryCode) {
  //   config.headers['X-Country-Code'] = countryCode;
  // }

  // Ajout du token d'authentification si disponible
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Gestion globale des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Gérer la déconnexion
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;