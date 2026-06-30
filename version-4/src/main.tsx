import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { HelmetProvider } from "react-helmet-async";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root not found");

const app = (
  <HelmetProvider>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </HelmetProvider>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
