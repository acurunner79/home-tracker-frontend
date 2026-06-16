// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from './pages/Dashboard';
import { useTheme } from './hooks/useTheme';
import { applyTheme } from './themes/themes';
import './index.css';

// Apply saved theme immediately to avoid flash
const savedTheme = localStorage.getItem('ht_theme') || 'darkside';
applyTheme(savedTheme);

function App() {
  const { theme, toggleTheme } = useTheme();
  return <Dashboard theme={theme} toggleTheme={toggleTheme} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
