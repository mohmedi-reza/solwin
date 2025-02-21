import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import '../polyfills';  // Keep this if it contains other polyfills

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
