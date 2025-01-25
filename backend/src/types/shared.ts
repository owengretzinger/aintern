export interface Message {
  text: string;
  audio?: string;
  lipsync?: any;
  facialExpression: "smile" | "sad" | "angry" | "surprised" | "funnyFace" | "default";
  animation:
    | "Talking_0"
    | "Talking_1"
    | "Talking_2"
    | "Crying"
    | "Laughing"
    | "Rumba"
    | "Idle"
    | "Terrified"
    | "Angry";
}

export interface ChatResponse {
  messages: Message[];
}

export interface ConversationHistory {
  role: "user" | "assistant" | "system";
  content: string;
} 