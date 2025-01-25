import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import "./index.css";
import { TRPCProvider } from "./trpc/trpc-react";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChatProvider>
      <TRPCProvider>
        <App />
      </TRPCProvider>
      <App />
    </ChatProvider>
  </React.StrictMode>
);
