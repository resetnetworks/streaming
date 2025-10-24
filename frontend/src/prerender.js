// src/prerender.js
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import App from "./App"

export async function prerender() {
  // React component को string में convert करें  
  const html = renderToString(<App />)
  
  return {
    html: html
  }
}
