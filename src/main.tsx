import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { AppStateProvider } from "./app/appState";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </StrictMode>,
);
