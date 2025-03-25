
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Log startup information to help with debugging
console.log("Application starting...");
console.log("Base URL:", import.meta.env.BASE_URL || '/interpreter-app/');
console.log("Environment:", import.meta.env.MODE);
console.log("Deployment path:", document.location.pathname);

// Create root and render app
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("App successfully rendered to DOM");
} else {
  console.error("Root element not found! Make sure the HTML contains an element with id 'root'");
}

// Add error monitoring
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add unhandled promise rejection monitoring
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise rejection:', event.reason);
});
