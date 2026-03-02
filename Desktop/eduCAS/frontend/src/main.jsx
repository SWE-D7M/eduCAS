import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import History from './pages/History.jsx'
import Login from './pages/Login.jsx'
import Stats from './pages/Stats.jsx'
import './pages/pages.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/login" element={<Login />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
