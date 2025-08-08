// Punto de entrada principal del frontend. Monta la app en el DOM y aplica el router global.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Monta la app en el elemento con id 'root', usando StrictMode para mejores advertencias y BrowserRouter para rutas.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
