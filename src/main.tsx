import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import StartReceivers from './message/StartReceivers';

const container = document.getElementById('root');
const root = createRoot(container!);

setTimeout(() => {
  StartReceivers()
})

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);