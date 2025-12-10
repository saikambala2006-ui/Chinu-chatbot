import React from 'react';
import { MessageSender, ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  const messageClasses = isUser
    ? "bg-blue-600 text-white rounded-br-none self-end dark:bg-blue-800"
    : "bg-gray-200 text-gray-800 rounded-bl-none self-start dark:bg-gray-700 dark:text-gray-100";

  const containerClasses = isUser
    ? "flex justify-end"
    : "flex justify-start";

  return (
    <div className={`${containerClasses} mb-4`}>
      <div className={`max-w-[70%] md:max-w-[60%] lg:max-w-[50%] p-3 rounded-xl shadow-md ${messageClasses}`}>
        <p className="text-sm md:text-base break-words">{message.text}</p>
        <span className="text-xs opacity-80 mt-1 block text-right">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;