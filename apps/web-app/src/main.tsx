import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { loadConfig } from './config';

const root = document.getElementById('root');
if (!root) {
  throw new Error("Élément #root introuvable dans index.html");
}

createRoot(root).render(
  <StrictMode>
    <App config={loadConfig()} />
  </StrictMode>,
);
