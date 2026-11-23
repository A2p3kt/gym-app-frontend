/**
 * @fileoverview Application entry point: loads global CSS and mounts <App />.
 * (AG Grid is set up in gridSetup.ts, which only the table pages import.)
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
