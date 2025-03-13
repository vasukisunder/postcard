import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

// New React 18 rendering method
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />); 