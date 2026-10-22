import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app.jsx'
import './index.css' // <-- ESTA LÍNEA ES IMPRESCINDIBLE PARA CARGAR LOS ESTILOS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
