import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { KeepAliveScope } from '@williamyi74/react-keepalive/es'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <KeepAliveScope>
        <App />
      </KeepAliveScope>
    </BrowserRouter>
  </React.StrictMode>
)
