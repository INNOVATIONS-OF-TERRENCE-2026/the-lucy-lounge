import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

/* ===============================
   CORE APP
================================ */
import App from "./App";

/* ===============================
   GLOBAL STYLES
================================ */
import "./index.css";

/* ===============================
   ROOT MOUNT
================================ */
const root = document.getElementById("root");

if (!root) {
  throw new Error("Lucy Lounge failed to mount: #root not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
