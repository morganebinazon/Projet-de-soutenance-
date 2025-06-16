import React, { useState, useEffect, useRef } from 'react';
import { useIA } from '@/hooks/use-ia';
import { iaService } from '@/services/ia.service';

// Import des composants Shadcn UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, X, AlertCircle, Trash2, RefreshCw } from "lucide-react";
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
    devise?: string;
    details?: string;
  };
  lang?: string; 
}

// --- Composant Chatbot Intelligent ---

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('fr');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Utilisation du hook useIA
  const { sendMessage, isLoading, error, clearError } = useIA();

  useEffect(() => {
    if (isChatbotOpen && messages.length === 0) {
      // Message d'accueil intelligent qui s'adapte
      const welcomeText = iaService.getContextualMessage('welcome');
      setMessages([{ 
        sender: 'bot', 
        text: welcomeText,
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

  // Détecte la langue du dernier message utilisateur
  useEffect(() => {
    const lastUserMessage = messages
      .filter(msg => msg.sender === 'user')
      .pop();
    
    if (lastUserMessage) {
      const lang = iaService.detectLanguage(lastUserMessage.text);
      setDetectedLanguage(lang);
    }
  }, [messages]);

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

      // Traitement des actions spéciales avec intelligence
      if (action === 'display_paie_result' && data.net !== undefined) {
        
        // Utilise les informations intelligentes fournies par l'IA
        const formatCurrency = (value: number) => {
          return iaService.formatCurrency(value, data, detectedLanguage);
        };

        // Messages contextuels intelligents
        const calcDetailsLabel = iaService.getContextualMessage('calculation_details', userMessageText);
        
        botResponseText += `\n\n**${calcDetailsLabel}:**\n`;
        botResponseText += `💰 Brut: ${formatCurrency(data.brut || 0)}\n`;
        botResponseText += `💵 Net: ${formatCurrency(data.net)}\n`;
        
        if (data.pays) {
          botResponseText += `🌍 Pays: ${data.pays.charAt(0).toUpperCase() + data.pays.slice(1)}\n`;
        }
        
        if (data.devise) {
          botResponseText += `💱 Devise: ${data.devise}\n`;
        }
        
        if (data.details) {
          botResponseText += `📝 ${data.details}`;
        }
        
      } else if (action === 'close_chatbot') {
        setTimeout(() => setIsChatbotOpen(false), 1000);
      }

      const botMessage: ChatMessage = {
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date()
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message au chatbot:', error);
      
      // Message d'erreur intelligent qui s'adapte à la langue
      const errorMessage = error.message || iaService.getLocalizedErrorMessage(userMessageText);
      
      const errorBotMessage: ChatMessage = {
        sender: 'bot',
        text: errorMessage,
        timestamp: new Date()
      };

      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
    }
  };

  const handleClearHistory = async () => {
    try {
      await iaService.clearChatHistory();
      setMessages([]);
      // Remettre le message d'accueil
      const welcomeText = iaService.getContextualMessage('welcome');
      setMessages([{ 
        sender: 'bot', 
        text: welcomeText,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'historique:', error);
    }
  };

  // Messages contextuels selon la langue détectée
  const getLocalizedLabel = (key: string): string => {
    const labels: { [key: string]: { [lang: string]: string } } = {
      placeholder: {
        fr: "Posez votre question...",
        en: "Ask your question...",
        es: "Haz tu pregunta..."
      },
      send: {
        fr: "Envoyer",
        en: "Send", 
        es: "Enviar"
      },
      clear: {
        fr: "Effacer",
        en: "Clear",
        es: "Limpiar"
      },
      openChat: {
        fr: "Ouvrir le chatbot",
        en: "Open chatbot",
        es: "Abrir chatbot"
      },
      closeChat: {
        fr: "Fermer le chatbot", 
        en: "Close chatbot",
        es: "Cerrar chatbot"
      },
      thinking: {
        fr: "L'assistant réfléchit...",
        en: "Assistant is thinking...",
        es: "El asistente está pensando..."
      },
      startConversation: {
        fr: "Commencez la conversation ! L'IA s'adaptera automatiquement.",
        en: "Start the conversation! The AI will adapt automatically.",
        es: "¡Inicia la conversación! La IA se adaptará automáticamente."
      }
    };
    
    return labels[key]?.[detectedLanguage] || labels[key]?.fr || key;
  };

  return (
    <>
      {/* Bouton pour ouvrir/fermer le chatbot */}
      <button
        className="fixed bottom-5 right-5 bg-benin-green hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-[1000] transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-benin-green focus:ring-opacity-75"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        aria-label={isChatbotOpen ? getLocalizedLabel("closeChat") : getLocalizedLabel("openChat")}
      >
        {isChatbotOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Conteneur du chatbot */}
      {isChatbotOpen && (
        <div className="fixed bottom-20 right-5 w-80 md:w-96 h-[500px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl flex flex-col z-[999] animate-fade-in-up">
          {/* En-tête du chatbot avec indicateur de langue */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-benin-green" />
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Assistant IA Intelligent</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  🌍 {detectedLanguage.toUpperCase()} • Auto-adaptatif
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearHistory}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                aria-label={getLocalizedLabel("clear")}
                title={getLocalizedLabel("clear")}
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={getLocalizedLabel("closeChat")}
              >
                <X size={20} />
              </button>
            </div>
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
                <p className="text-sm">{getLocalizedLabel("startConversation")}</p>
                <div className="mt-2 text-xs opacity-75">
                  FR • EN • ES
                </div>
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
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                  <div className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString(detectedLanguage, { 
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
                    <RefreshCw className="animate-spin h-4 w-4 text-benin-green" />
                    <span className="text-sm">{getLocalizedLabel("thinking")}</span>
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
              placeholder={getLocalizedLabel("placeholder")}
              className="flex-1 rounded-full px-4 py-2 mr-2 bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-benin-green text-gray-900 dark:text-gray-100"
              disabled={isLoading}
              maxLength={1000}
            />
            <Button 
              type="submit" 
              className="bg-benin-green hover:bg-benin-green/90 text-white rounded-full px-4 py-2 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading || input.trim() === ''}
            >
              {getLocalizedLabel("send")}
            </Button>
          </form>

          {/* Indicateur de statut en bas */}
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-xs text-center text-gray-500 dark:text-gray-400">
            🤖 IA Adaptive • Détection auto: langue, devise, contexte
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;