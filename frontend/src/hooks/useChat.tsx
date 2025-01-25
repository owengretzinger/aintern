import { createContext, useContext, useEffect, useState } from "react";
import { trpcReact } from "../trpc/trpc-react";
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

  const chatMutation = trpcReact.chat.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, ...data.messages]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setIsLoading(false);
    },
  });

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    chatMutation.mutate({ message });
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
