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
    devise?: string;
    details?: string;
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
   * Efface l'historique des conversations
   */
  async clearChatHistory(): Promise<void> {
    try {
      await axios.delete(`${API_URL}/history`);
    } catch (error: any) {
      console.error('Erreur lors de l\'effacement de l\'historique:', error);
      throw new Error('Impossible d\'effacer l\'historique des conversations');
    }
  },

  /**
   * Valide un message avant envoi
   */
  validateMessage(message: string): boolean {
    return typeof message === 'string' && message.trim().length > 0 && message.trim().length <= 1000;
  },

  /**
   * Formate intelligemment les montants selon les données reçues de l'IA
   */
  formatCurrency(amount: number, data?: any, language: string = 'fr'): string {
    // L'IA nous dit quelle devise utiliser
    const currency = data?.devise || 'XOF';
    
    try {
      // Adaptations selon la devise
      let locale = 'fr-FR';
      if (language === 'en') locale = 'en-US';
      if (language === 'es') locale = 'es-ES';
      
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      // Fallback si le formatage échoue
      console.warn('Erreur de formatage de devise:', error);
      return `${amount.toLocaleString()} ${currency}`;
    }
  },

  /**
   * Détecte automatiquement la langue d'un texte (simple)
   */
  detectLanguage(text: string): string {
    const textLower = text.toLowerCase();
    
    // Détection basique par mots-clés
    if (textLower.match(/\b(bonjour|bonsoir|merci|français|salut|comment|pourquoi)\b/)) {
      return 'fr';
    }
    if (textLower.match(/\b(hello|hi|thank|english|how|why|what)\b/)) {
      return 'en';
    }
    if (textLower.match(/\b(hola|gracias|español|cómo|por qué|qué)\b/)) {
      return 'es';
    }
    
    // Par défaut français pour l'Afrique de l'Ouest
    return 'fr';
  },

  /**
   * Extrait les informations de calcul de paie depuis un message (simplifié)
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
   * Génère un message d'erreur selon la langue détectée automatiquement
   */
  getLocalizedErrorMessage(userMessage?: string): string {
    const detectedLang = userMessage ? this.detectLanguage(userMessage) : 'fr';
    
    const messages = {
      fr: 'Désolé, une erreur est survenue lors de la communication avec l\'assistant. Veuillez réessayer.',
      en: 'Sorry, an error occurred while communicating with the assistant. Please try again.',
      es: 'Lo siento, ocurrió un error al comunicarse con el asistente. Por favor, inténtalo de nuevo.'
    };
    
    return messages[detectedLang as keyof typeof messages] || messages.fr;
  },

  /**
   * Messages contextuels intelligents
   */
  getContextualMessage(key: string, userMessage?: string): string {
    const detectedLang = userMessage ? this.detectLanguage(userMessage) : 'fr';
    
    const messages: { [key: string]: { [lang: string]: string } } = {
      welcome: {
        fr: 'Bonjour ! Je suis votre assistant intelligent pour la simulation de paie. Je m\'adapte automatiquement à votre langue et région.',
        en: 'Hello! I am your smart payroll simulation assistant. I automatically adapt to your language and region.',
        es: '¡Hola! Soy tu asistente inteligente de simulación de nóminas. Me adapto automáticamente a tu idioma y región.'
      },
      thinking: {
        fr: 'L\'assistant réfléchit...',
        en: 'Assistant is thinking...',
        es: 'El asistente está pensando...'
      },
      calculation_details: {
        fr: 'Détail du calcul',
        en: 'Calculation details',
        es: 'Detalles del cálculo'
      }
    };
    
    return messages[key]?.[detectedLang] || messages[key]?.fr || key;
  },

  /**
   * Obtient des informations contextuelles sur les devises
   */
  getCurrencyContext(country?: string) {
    const westafrican = ['benin', 'bénin', 'togo', 'senegal', 'mali', 'burkina', 'niger', 'ivoire'];
    
    if (country && westafrican.some(c => country.toLowerCase().includes(c))) {
      return {
        currency: 'XOF',
        region: 'West Africa',
        union: 'UEMOA'
      };
    }
    
    return {
      currency: 'USD',
      region: 'International',
      union: null
    };
  }
};