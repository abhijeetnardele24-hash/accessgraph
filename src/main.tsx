import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/index.css';

// Register Service Worker for offline capability
if ('serviceWorker' in navigator && (import.meta.env.PROD || process.env.NODE_ENV === 'production')) {
  const registerSW = () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('AccessGraph ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('AccessGraph ServiceWorker registration failed:', error);
      });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
