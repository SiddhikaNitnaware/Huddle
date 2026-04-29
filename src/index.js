import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'leaflet/dist/leaflet.css';

/**
 * Using React 18 createRoot API for stability and concurrent features.
 * Note the inclusion of leaflet.css above - critical for map rendering.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);