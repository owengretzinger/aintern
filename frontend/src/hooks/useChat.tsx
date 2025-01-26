import { createContext, useContext, useEffect, useState } from "react";
import type { Message } from "../../../backend/src/types/shared";

interface ChatContextType {
  chat: (message: string) => Promise<void>;
  message: Message | null;
  onMessagePlayed: () => void;
  loading: boolean;
  cameraZoomed: boolean;
  setCameraZoomed: (zoomed: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [cameraZoomed, setCameraZoomed] = useState(true);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"}/api/chat/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, ...data.messages]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat: sendMessage,
        message,
        onMessagePlayed: () => {
          setMessages((messages) => messages.slice(1));
        },
        loading: isLoading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
