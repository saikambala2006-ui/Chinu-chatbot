import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import LoadingSpinner from './LoadingSpinner';
import { MessageSender, ChatMessage as ChatMessageType } from '../types';
import { getGeminiResponse } from '../services/geminiService';

interface ChatWindowProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ toggleTheme, isDarkMode }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isApiKeySelected, setIsApiKeySelected] = useState<boolean>(false);

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Effect to scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Effect to check API key status on mount
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setIsApiKeySelected(selected);
      } else {
        // Assume API key is available via process.env.API_KEY if aistudio API is not present
        setIsApiKeySelected(!!process.env.API_KEY);
      }
    };
    checkApiKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler for sending messages
  const sendMessage = useCallback(async () => {
    if (inputValue.trim() === '' || isLoading) {
      return;
    }

    const newUserMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: MessageSender.USER,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponseText = await getGeminiResponse(newUserMessage.text);

      const newBotMessage: ChatMessageType = {
        id: Date.now().toString() + '-bot',
        text: botResponseText,
        sender: MessageSender.BOT,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error("Failed to get response from Gemini:", error);
      const errorMessage: ChatMessageType = {
        id: Date.now().toString() + '-error',
        text: "I'm sorry, an unexpected error occurred. Please try again.",
        sender: MessageSender.BOT,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isLoading]);

  // Handler for key presses in the input field
  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }, [sendMessage]);

  const handleSelectApiKey = useCallback(async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setIsApiKeySelected(true); // Assume success to avoid race condition
    } else {
      alert("API Key selection is not available in this environment. Please ensure process.env.API_KEY is set.");
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <div className="flex flex-col w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden md:h-[80vh] transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md dark:from-blue-800 dark:to-indigo-950 transition-colors duration-300">
        <div className="flex items-center">
          <img src="https://picsum.photos/50/50" alt="CHINU Avatar" className="w-10 h-10 rounded-full mr-3 shadow-sm" />
          <h1 className="text-xl md:text-2xl font-bold">CHINU (College Assistant)</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="px-3 py-2 bg-white text-blue-600 rounded-full text-sm font-semibold hover:bg-gray-100 dark:bg-gray-700 dark:text-blue-200 dark:hover:bg-gray-600 transition-colors duration-200"
            title="Clear Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.14-2.006-2.201C11.971 2.993 10.137 3 7.25 3A2.25 2.25 0 005 5.25v.916m7.5 0h-7.5" />
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            className="px-3 py-2 bg-white text-blue-600 rounded-full text-sm font-semibold hover:bg-gray-100 dark:bg-gray-700 dark:text-blue-200 dark:hover:bg-gray-600 transition-colors duration-200"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.21l-1.591 1.591M3 12H5.25m-.386-6.364l1.591 1.591M12 12a3 3 0 110-6 3 3 0 010 6zm-5.25 4.5h10.5a.75.75 0 00.75-.75V8.25a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v7.5c0 .414.336.75.75.75z" />
              </svg>

            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.006 0 0012 21a9.753 9.753 0 009.752-6.748z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleSelectApiKey}
            className="px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-semibold hover:bg-gray-100 dark:bg-gray-700 dark:text-blue-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            {isApiKeySelected ? "API Key Selected" : "Select API Key"}
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 text-center transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4 text-blue-400 dark:text-blue-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H16.5m2.25 6H2.25c-.621 0-1.125-.504-1.125-1.125V11.375c0-.621.504-1.125 1.125-1.125h16.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125Zm-16.5 0V6.625c0-.621.504-1.125 1.125-1.125h10.5a1.125 1.125 0 0 1 1.125 1.125v9.75m-7.5-3h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H8.625c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Zm7.5-3H12m4.125 0H16.5M12 18.75h.008v.008H12v-.008Zm0 2.25h.008v.008H12v-.008Zm2.25 0h.008v.008H14.25v-.008Zm2.25 0h.008v.008H16.5v-.008Z" />
            </svg>
            <p className="text-lg font-medium mb-2">Welcome to CHINU, your college assistant!</p>
            <p className="text-sm">Ask me anything about Avanthees St Theressa Institute of Engineering and Technology.</p>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl rounded-bl-none shadow-md transition-colors duration-300">
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="sticky bottom-0 p-4 bg-gray-100 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex items-center gap-2 flex-shrink-0 transition-colors duration-300">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isApiKeySelected ? "Type your message..." : "Please select your API Key first..."}
          className="flex-1 p-3 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-800 dark:text-gray-100 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          disabled={isLoading || !isApiKeySelected}
          aria-label="Chat input"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-blue-300 dark:disabled:bg-blue-700 disabled:cursor-not-allowed"
          disabled={isLoading || inputValue.trim() === '' || !isApiKeySelected}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>

      {/* Footer with Developer Details */}
      <div className="p-2 bg-gray-50 border-t border-gray-200 dark:bg-gray-950 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
        Developed by: Sai (CSE AI and ML branch)
      </div>
    </div>
  );
};

export default ChatWindow;