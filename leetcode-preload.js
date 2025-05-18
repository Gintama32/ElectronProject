const { contextBridge } = require('electron')

// Inject custom UI and styling when the page loads
window.addEventListener('DOMContentLoaded', () => {
  // Add custom CSS to hide distracting elements
  const style = document.createElement('style')
  style.textContent = `
    /* Hide distracting elements */
    .navbar-right-container, 
    .social-links,
    .footer,
    .ads-container,
    .discussion-container { 
      display: none !important; 
    }
    /* Focus on the main content */
    .content-wrapper {
      margin: 0 auto;
      max-width: 1200px;
      padding: 20px;
    }
    /* Enhance the coding workspace */
    .monaco-editor {
      font-size: 16px !important;
    }
  `
  document.head.appendChild(style)
}) 