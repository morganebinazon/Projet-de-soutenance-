import React, { useState, useEffect, useRef } from 'react';
import { useIA } from '@/hooks/use-ia';
import { iaService } from '@/services/ia.service';

// Import des composants Shadcn UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// --- Interfaces pour le typage TypeScript ---

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface BotResponseData {
  reply: string;
  action: string | null;
  data: {
    brut?: number;
    net?: number;
    pays?: string;
  };
  lang?: string; 
}

// --- Fonctions de localisation pour les messages gérés côté frontend ---
const getLocalizedFrontendMessage = (key: string, lang: string = 'fr'): string => {
  const messages: { [key: string]: { [lang: string]: string } } = {
    "welcome": {
      "fr": "Bonjour ! Je suis votre assistant pour le simulateur de paie. Posez-moi vos questions sur la plateforme ou les règles de calcul.",
      "en": "Hello! I am your assistant for the payroll simulator. Ask me your questions about the platform or calculation rules.",
      "es": "¡Hola! Soy tu asistente para el simulador de nóminas. Hazme tus preguntas sobre la plataforma o las reglas de cálculo.",
    },
    "error_backend": {
      "fr": "Désolé, une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer.",
      "en": "Sorry, an error occurred while communicating with the assistant. Please try again.",
      "es": "Lo siento, ocurrió un error al comunicarse con el asistente. Por favor, inténtalo de nuevo.",
    },
    "placeholder_input": {
      "fr": "Posez votre question...",
      "en": "Ask your question...",
      "es": "Haz tu pregunta...",
    },
    "send_button": {
      "fr": "Envoyer",
      "en": "Send",
      "es": "Enviar",
    },
    "open_chatbot_label": {
      "fr": "Ouvrir le chatbot",
      "en": "Open chatbot",
      "es": "Abrir chatbot",
    },
    "close_chatbot_label": {
      "fr": "Fermer le chatbot",
      "en": "Close chatbot",
      "es": "Cerrar chatbot",
    },
    "empty_chat_prompt": {
      "fr": "Commencez la conversation ! Je suis là pour vous aider.",
      "en": "Start the conversation! I'm here to help you.",
      "es": "¡Inicia la conversación! Estoy aquí para ayudarte.",
    },
    "calculation_details": {
      "fr": "Détail du calcul",
      "en": "Calculation details",
      "es": "Detalles del cálculo",
    },
    "gross": {
      "fr": "Brut",
      "en": "Gross",
      "es": "Bruto",
    },
    "net": {
      "fr": "Net",
      "en": "Net",
      "es": "Neto",
    },
    "country": {
      "fr": "Pays",
      "en": "Country",
      "es": "País",
    }
  };

  return messages[key]?.[lang] || messages[key]?.["en"] || "Message not found.";
};

// --- Composant Chatbot ---

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Utilisation du hook useIA
  const { sendMessage, isLoading, error, clearError } = useIA();

  // Détection de la langue du navigateur comme langue par défaut pour le frontend
  const [currentBrowserLang, setCurrentBrowserLang] = useState<string>('fr');

  useEffect(() => {
    // Tente de récupérer la langue du navigateur
    const lang = navigator.language.split('-')[0];
    setCurrentBrowserLang(lang);

    if (isChatbotOpen && messages.length === 0) {
      // Message d'accueil localisé
      setMessages([{ 
        sender: 'bot', 
        text: getLocalizedFrontendMessage("welcome", lang),
        timestamp: new Date()
      }]);
    }
  }, [isChatbotOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Efface l'erreur quand l'utilisateur tape
  useEffect(() => {
    if (error && input.trim()) {
      clearError();
    }
  }, [input, error, clearError]);

  const handleSendMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessageText = input.trim();
    const userMessage: ChatMessage = {
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    try {
      // Utilisation du service IA via le hook
      const response: BotResponseData = await sendMessage(userMessageText);

      let botResponseText: string = response.reply;
      const action: string | null = response.action;
      const data: BotResponseData['data'] = response.data;
      const botResponseLang: string = response.lang || currentBrowserLang;

      // Traitement des actions spéciales
      if (action === 'display_paie_result' && data.net !== undefined) {
        // Formatage des montants
        const formatCurrency = (value: number) => {
          return iaService.formatCurrency(value, data.pays, botResponseLang);
        };

        botResponseText += `\n\n**${getLocalizedFrontendMessage("calculation_details", botResponseLang)}:**\n`;
        botResponseText += `${getLocalizedFrontendMessage("gross", botResponseLang)}: ${formatCurrency(data.brut || 0)}\n`;
        botResponseText += `${getLocalizedFrontendMessage("net", botResponseLang)}: ${formatCurrency(data.net)}\n`;
        botResponseText += `${getLocalizedFrontendMessage("country", botResponseLang)}: ${data.pays ? data.pays.charAt(0).toUpperCase() + data.pays.slice(1) : 'N/A'}`;
      } else if (action === 'close_chatbot') {
        setTimeout(() => setIsChatbotOpen(false), 1000);
      } else if (action === 'request_montant' || action === 'request_pays' || action === 'guide_platform') {
        console.log(`Action suggérée par le bot : ${action}`);
      }

      const botMessage: ChatMessage = {
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message au chatbot:', error);
      
      // Message d'erreur depuis le service ou fallback
      const errorMessage = error.message || getLocalizedFrontendMessage("error_backend", currentBrowserLang);
      
      const errorBotMessage: ChatMessage = {
        sender: 'bot',
        text: errorMessage,
        timestamp: new Date()
      };

      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    }
  };

  return (
    <>
      {/* Bouton pour ouvrir/fermer le chatbot */}
      <button
        className="fixed bottom-5 right-5 bg-benin-green hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-[1000] transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-benin-green focus:ring-opacity-75"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        aria-label={isChatbotOpen ? getLocalizedFrontendMessage("close_chatbot_label", currentBrowserLang) : getLocalizedFrontendMessage("open_chatbot_label", currentBrowserLang)}
      >
        {isChatbotOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Conteneur du chatbot */}
      {isChatbotOpen && (
        <div className="fixed bottom-20 right-5 w-80 md:w-96 h-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex flex-col z-[999] animate-fade-in-up">
          {/* En-tête du chatbot */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-benin-green" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Assistant Virtuel</h3>
            </div>
            <button
              onClick={() => setIsChatbotOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={getLocalizedFrontendMessage("close_chatbot_label", currentBrowserLang)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive" className="m-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Zone des messages */}
          <ScrollArea className="flex-1 p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <Bot className="h-12 w-12 mb-4" />
                <p>{getLocalizedFrontendMessage("empty_chat_prompt", currentBrowserLang)}</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-benin-green text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                  />
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString(currentBrowserLang, { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-benin-green"></div>
                    <span>L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Formulaire de saisie */}
          <form onSubmit={handleSendMessage} className="flex p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getLocalizedFrontendMessage("placeholder_input", currentBrowserLang)}
              className="flex-1 rounded-full px-4 py-2 mr-2 bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-benin-green text-gray-900 dark:text-gray-100"
              disabled={isLoading}
              maxLength={1000}
            />
            <Button 
              type="submit" 
              className="bg-benin-green hover:bg-benin-green/90 text-white rounded-full px-4 py-2 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading || input.trim() === ''}
            >
              {getLocalizedFrontendMessage("send_button", currentBrowserLang)}
            </Button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;