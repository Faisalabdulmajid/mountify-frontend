// src/index.js (KODE FINAL - SUMBER PROVIDER)

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { ModalProvider } from "./contexts/ModalContext";

import App from "./App";
import "./App.css"; // Impor CSS Global Anda

const root = ReactDOM.createRoot(document.getElementById("root"));

// STRUKTUR YANG BENAR: Provider hanya ada di sini, membungkus App.
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
