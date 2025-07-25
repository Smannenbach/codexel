import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (event.reason && typeof event.reason === 'object') {
    console.error('Rejection details:', {
      message: event.reason.message,
      stack: event.reason.stack,
      promise: event.promise
    });
  }
  // Prevent the default browser error reporting
  event.preventDefault();
});

// Global error handling for JavaScript errors
window.addEventListener('error', (event) => {
  console.error('JavaScript error:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Ensure root element exists
const rootElement = document.getElementById("root");
if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0a; color: white; font-family: system-ui;">
        <div style="text-align: center; max-width: 500px; padding: 2rem;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">Codexel.ai</h1>
          <p style="margin-bottom: 2rem; opacity: 0.8;">Loading application...</p>
          <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
}
