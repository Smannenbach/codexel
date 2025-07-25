import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handling for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection:', event.reason);
  // Prevent the default browser error reporting
  event.preventDefault();
});

// Global error handling for JavaScript errors
window.addEventListener('error', (event) => {
  console.warn('JavaScript error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
