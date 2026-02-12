
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Polyfill for process.env in the browser to support Gemini API initialization
// Fix: Added type assertion to access 'process' on window to satisfy TypeScript and allow polyfilling
if (typeof window !== 'undefined' && !(window as any).process) {
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
