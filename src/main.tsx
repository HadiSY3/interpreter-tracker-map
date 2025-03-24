
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log startup information to help with debugging
console.log("Application starting...");
console.log("Base URL:", import.meta.env.BASE_URL || '/');
console.log("Environment:", import.meta.env.MODE);

// Create root and render app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found! Make sure the HTML contains an element with id 'root'");
}
