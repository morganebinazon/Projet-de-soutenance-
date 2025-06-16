import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/ia';

export interface ChatMessage {
  message: string;
}

export interface BotResponseData {
  reply: string;
  action: string | null;
  data: {
    brut?: number;
    net?: number;
    pays?: string;
  };
  lang?: string;
}

export interface ChatHistoryItem {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

export const iaService = {
  /**
   * Envoie un message au chatbot et retourne la réponse
   */
  async sendMessage(message: string): Promise<BotResponseData> {
    try {
      const response = await axios.post<BotResponseData>(`${API_URL}/chatbot`, {
        message: message.trim()
      });
      return response.data;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message au chatbot:', error);
      
      // Gestion des erreurs avec messages localisés
      const errorMessage = error.response?.data?.error || error.message || 'Une erreur est survenue';
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Récupère l'historique des conversations
   */
  async getChatHistory(): Promise<ChatHistoryItem[]> {
    try {
      const response = await axios.get<{ history: ChatHistoryItem[] }>(`${API_URL}/history`);
      return response.data.history;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error('Impossible de récupérer l\'historique des conversations');
    }
  },

  /**
   * Valide un message avant envoi
   */
  validateMessage(message: string): boolean {
    return typeof message === 'string' && message.trim().length > 0 && message.trim().length <= 1000;
  },

  /**
   * Formate les montants selon la devise du pays
   */
  formatCurrency(amount: number, country?: string, language: string = 'fr'): string {
    const currency = country?.toLowerCase().includes('benin') || country?.toLowerCase().includes('togo') ? 'XOF' : 'USD';
    
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  /**
   * Extrait les informations de calcul de paie depuis un message
   */
  extractPayrollInfo(message: string): { amount?: number; country?: string } {
    const result: { amount?: number; country?: string } = {};
    
    // Extraction du montant
    const amountMatch = message.match(/(\d+(?:[\s,.]?\d+)*)/);
    if (amountMatch) {
      result.amount = parseInt(amountMatch[1].replace(/[\s,.]/g, ''));
    }
    
    // Extraction du pays
    const countryMatch = message.match(/(benin|bénin|togo)/i);
    if (countryMatch) {
      result.country = countryMatch[1].toLowerCase();
    }
    
    return result;
  },

  /**
   * Détermine si un message concerne un calcul de paie
   */
  isPayrollCalculationRequest(message: string): boolean {
    const payrollKeywords = [
      'calcul', 'salaire', 'paie', 'net', 'brut',
      'calculate', 'salary', 'payroll', 'gross',
      'calcular', 'salario', 'nómina'
    ];
    
    const messageLower = message.toLowerCase();
    return payrollKeywords.some(keyword => messageLower.includes(keyword));
  },

  /**
   * Génère un message d'erreur localisé
   */
  getLocalizedErrorMessage(language: string = 'fr'): string {
    const messages = {
      fr: 'Désolé, une erreur est survenue lors de la communication avec l\'assistant. Veuillez réessayer.',
      en: 'Sorry, an error occurred while communicating with the assistant. Please try again.',
      es: 'Lo siento, ocurrió un error al comunicarse con el asistente. Por favor, inténtalo de nuevo.'
    };
    
    return messages[language as keyof typeof messages] || messages.fr;
  }
};