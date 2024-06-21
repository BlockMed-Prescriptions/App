import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import RecetaReceiver from './message/RecetaReceiver';
import DispensaReceiver from './message/DispensaReceiver';

const container = document.getElementById('root');
const root = createRoot(container!);


setTimeout(() => RecetaReceiver(), 1000);
setTimeout(() => DispensaReceiver(), 1000);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);