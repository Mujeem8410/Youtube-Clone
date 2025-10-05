import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "react-hot-toast";
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster  reverseOrder={false}  toastOptions={{
    duration: 1000,
  }}
  containerStyle={{
    top: 600,
    left: 1100, 
  }}/>
  </StrictMode>,
)
