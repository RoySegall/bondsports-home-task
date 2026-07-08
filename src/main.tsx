import React from 'react'
import ReactDOM from 'react-dom/client'

// Self-hosted fonts — bundled by Vite so the app renders correctly offline.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/tokens.css'
import './styles/base.css'
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
