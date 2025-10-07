/* @jsxImportSource react */
import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function Services(){
  const [services, setServices] = useState([])

  async function load(){
    const r = await axios.get(`${API}/items?type=service`)
    setServices(r.data)
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="container">
      <h2 style={{marginTop:16}}>Services</h2>
      <p>Education-first: workshops, training, nutrition consults. Booking flows coming soon.</p>
      <div className="grid grid-3" style={{marginTop:12}}>
        {services.map(s => <ProductCard key={s.id} item={s} />)}
      </div>
    </div>
  )
}
