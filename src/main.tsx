// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 🔥 This line is REQUIRED so all your Tailwind + CSS variables + theme styles load
import "./index.css";

// Apply dark mode immediately before React renders to prevent flash
const darkModePref = localStorage.getItem('lucy-dark-mode');
if (darkModePref !== 'light') {
  document.documentElement.classList.add('dark');
  localStorage.setItem('lucy-dark-mode', 'dark');
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
