import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Day1Upload } from './pages/Day1Upload';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Day1Upload />
  </StrictMode>
);
