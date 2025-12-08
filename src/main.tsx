// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 🔥 This line is REQUIRED so all your Tailwind + CSS variables + theme styles load
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
