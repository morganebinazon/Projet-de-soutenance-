import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Assurez-vous que axios est installé (npm install axios ou yarn add axios)

// Import des composants Shadcn UI
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageCircle, X } from "lucide-react"; // Importez les icônes nécessaires

// --- Interfaces pour le typage TypeScript ---

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

interface BotResponseData {
  reply: string;
  action: string | null;
  data: {
    brut?: number;
    net?: number;
    pays?: string;
  };
  // Ajout pour la langue de la réponse du bot (optionnel, si le backend le renvoie explicitement)
  // Sinon, le frontend peut tenter de la deviner pour les messages locaux.
  lang?: string; 
}

// --- Fonctions de localisation pour les messages gérés côté frontend ---
// Ces messages sont destinés aux interactions basiques (bienvenue, erreur)
// avant ou après l'interaction avec le backend/LLM.
const getLocalizedFrontendMessage = (key: string, lang: string = 'fr'): string => {
  const messages: { [key: string]: { [lang: string]: string } } = {
    "welcome": {
      "fr": "Bonjour ! Je suis votre assistant pour le simulateur de paie. Posez-moi vos questions sur la plateforme ou les règles de calcul.",
      "en": "Hello! I am your assistant for the payroll simulator. Ask me your questions about the platform or calculation rules.",
      "es": "¡Hola! Soy tu asistente para el simulador de nóminas. Hazme tus preguntas sobre la plataforma o las reglas de cálculo.",
      // Ajoutez d'autres langues ici
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
    }
  };

  // Tente de récupérer la traduction, sinon fallback à l'anglais, sinon un message générique.
  return messages[key]?.[lang] || messages[key]?.["en"] || "Message not found.";
};

// --- Composant Chatbot ---

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Pour le statut de chargement
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Détection de la langue du navigateur comme langue par défaut pour le frontend
  // Cela sera utilisé pour les messages d'interface gérés par le frontend.
  const [currentBrowserLang, setCurrentBrowserLang] = useState<string>('fr');

  useEffect(() => {
    // Tente de récupérer la langue du navigateur (ex: 'fr-FR' ou 'en-US')
    const lang = navigator.language.split('-')[0]; // Prend juste 'fr' ou 'en'
    setCurrentBrowserLang(lang);

    if (isChatbotOpen && messages.length === 0) {
      // Message d'accueil localisé
      setMessages([{ sender: 'bot', text: getLocalizedFrontendMessage("welcome", lang) }]);
    }
  }, [isChatbotOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const API_URL: string = 'http://localhost:5000/api/chatbot'; // Votre endpoint Node.js

  const handleSendMessage = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessageText = input.trim();
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessageText }]);
    setInput('');
    setIsLoading(true); // Active l'état de chargement

    try {
      // Envoie le message au backend Node.js
      // Le backend est responsable de la détection de la langue et de la réponse
      const response = await axios.post<BotResponseData>(API_URL, { message: userMessageText });

      let botResponseText: string = response.data.reply;
      const action: string | null = response.data.action;
      const data: BotResponseData['data'] = response.data.data;
      const botResponseLang: string = response.data.lang || currentBrowserLang; // Récupère la langue du bot si fournie, sinon utilise celle du navigateur

      if (action === 'display_paie_result' && data.net !== undefined) {
        // Formatte les montants en fonction du pays (si nécessaire) ou une devise générique
        const formatCurrency = (value: number) => {
            return new Intl.NumberFormat(botResponseLang, {
                style: 'currency',
                currency: data.pays === 'benin' || data.pays === 'togo' ? 'XOF' : 'USD', // Adaptez la devise
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        };
        botResponseText += `\n\n**${botResponseLang === 'fr' ? 'Détail du calcul' : botResponseLang === 'en' ? 'Calculation details' : 'Detalles del cálculo'} :**\n`;
        botResponseText += `${botResponseLang === 'fr' ? 'Brut' : botResponseLang === 'en' ? 'Gross' : 'Bruto'}: ${formatCurrency(data.brut || 0)}\n`;
        botResponseText += `${botResponseLang === 'fr' ? 'Net' : botResponseLang === 'en' ? 'Net' : 'Neto'}: ${formatCurrency(data.net)}\n`;
        botResponseText += `${botResponseLang === 'fr' ? 'Pays' : botResponseLang === 'en' ? 'Country' : 'País'}: ${data.pays ? data.pays.charAt(0).toUpperCase() + data.pays.slice(1) : 'N/A'}`;
      } else if (action === 'close_chatbot') {
        setTimeout(() => setIsChatbotOpen(false), 1000);
      } else if (action === 'request_montant' || action === 'request_pays' || action === 'guide_platform') {
        console.log(`Action suggérée par le bot : ${action}`);
      }

      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botResponseText }]);

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message au chatbot:', error);
      // Message d'erreur localisé
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: getLocalizedFrontendMessage("error_backend", currentBrowserLang) }]);
    } finally {
      setIsLoading(false); // Désactive l'état de chargement
    }
  };

  return (
    <>
      {/* Bouton pour ouvrir/fermer le chatbot */}
      <button
        className="fixed bottom-5 right-5 bg-benin-green hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-[1000] transition-transform duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-benin-green focus:ring-opacity-75" // Changed bg-green-600 to bg-benin-green, and focus:ring-green-500 to focus:ring-benin-green
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
              <Bot className="h-6 w-6 text-benin-green" /> {/* Changed text-green-600 to text-benin-green */}
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
                      ? 'bg-benin-green text-white rounded-br-none' // Changed bg-blue-500 to bg-benin-green
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                  }`}
                  // Pour gérer les sauts de ligne depuis le backend (Markdown)
                  dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[75%] p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none animate-pulse">
                  <span>...</span>
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
              className="flex-1 rounded-full px-4 py-2 mr-2 bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-benin-green text-gray-900 dark:text-gray-100" // Changed focus:ring-blue-500 to focus:ring-benin-green
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="bg-benin-green hover:bg-benin-green/90 text-white rounded-full px-4 py-2 transition-colors duration-200 disabled:opacity-50" // Changed bg-blue-500 to bg-benin-green, and hover:bg-blue-600 to hover:bg-benin-green/90
              disabled={isLoading}
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