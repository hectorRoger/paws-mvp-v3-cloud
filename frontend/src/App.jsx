/* @jsxImportSource react */
import React from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Admin from './pages/Admin.jsx'
import './styles.css'

export default function App(){
  return (
    <div>
      <header className="header">
        <div className="container">
          <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <h1>Paws & Claws Kigali — MVP v3</h1>
              <span className="badge">Demo • Cloud-ready • No payments yet</span>
            </div>
            <nav className="nav">
              <NavLink to="/" end>Shop</NavLink>
              <NavLink to="/services">Services</NavLink>
              <NavLink to="/admin">Admin</NavLink>
            </nav>
          </div>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/services" element={<Services/>}/>
        <Route path="/admin" element={<Admin/>}/>
      </Routes>
      <footer className="footer">
        <div className="container">
          <small>© {new Date().getFullYear()} Paws & Claws Kigali — MVP v3</small>
        </div>
      </footer>
    </div>
  )
}
