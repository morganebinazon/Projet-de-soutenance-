import { useState, useCallback } from 'react';
import { iaService, BotResponseData, ChatHistoryItem } from '@/services/ia.service';

interface UseIAState {
  isLoading: boolean;
  error: string | null;
  history: ChatHistoryItem[];
}

interface UseIAReturn extends UseIAState {
  sendMessage: (message: string) => Promise<BotResponseData>;
  loadHistory: () => Promise<void>;
  clearError: () => void;
  clearHistory: () => void;
}

export const useIA = (): UseIAReturn => {
  const [state, setState] = useState<UseIAState>({
    isLoading: false,
    error: null,
    history: []
  });

  /**
   * Envoie un message au chatbot
   */
  const sendMessage = useCallback(async (message: string): Promise<BotResponseData> => {
    // Validation du message
    if (!iaService.validateMessage(message)) {
      const error = 'Le message doit contenir entre 1 et 1000 caractères';
      setState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await iaService.sendMessage(message);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: null
      }));

      return response;
    } catch (error: any) {
      const errorMessage = error.message || iaService.getLocalizedErrorMessage();
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      throw error;
    }
  }, []);

  /**
   * Charge l'historique des conversations
   */
  const loadHistory = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const history = await iaService.getChatHistory();
      
      setState(prev => ({ 
        ...prev, 
        history, 
        isLoading: false,
        error: null
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Erreur lors du chargement de l\'historique'
      }));
    }
  }, []);

  /**
   * Efface l'erreur courante
   */
  const clearError = useCallback((): void => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Efface l'historique local
   */
  const clearHistory = useCallback((): void => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  return {
    ...state,
    sendMessage,
    loadHistory,
    clearError,
    clearHistory
  };
};