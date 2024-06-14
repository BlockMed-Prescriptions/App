import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import RecetaReceiver from './worker/RecetaReceiver';

const container = document.getElementById('root');
const root = createRoot(container!);


setTimeout(() => RecetaReceiver(), 1000);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);