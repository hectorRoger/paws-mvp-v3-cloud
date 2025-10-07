/* @jsxImportSource react */
import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from '../components/ProductCard.jsx'
import Controls from '../components/Controls.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function Home(){
  const [items, setItems] = useState([])
  const [bundles, setBundles] = useState([])
  const [categories, setCategories] = useState([])

  // filters
  const [q, setQ] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [category, setCategory] = useState('All')

  async function load(){
    const params = new URLSearchParams()
    params.set('type', 'product')
    if (q) params.set('q', q)
    if (min) params.set('min', min)
    if (max) params.set('max', max)
    if (category !== 'All') params.set('category', category)
    const url = `${API}/items?${params.toString()}`
    const r = await axios.get(url)
    setItems(r.data)
  }

  async function loadBundles(){
    const r = await axios.get(`${API}/items?type=bundle`)
    setBundles(r.data)
  }

  async function loadCategories(){
    const r = await axios.get(`${API}/categories`)
    setCategories(r.data)
  }

  useEffect(()=>{ load(); loadBundles(); loadCategories(); }, [])

  return (
    <div className="container">
      <div className="card" style={{marginTop:16, marginBottom:16}}>
        <strong>Deals & Bundles</strong>
        <div className="grid grid-4" style={{marginTop:8}}>
          {bundles.map(b => <ProductCard key={b.id} item={b} />)}
        </div>
      </div>

      <h2>Shop Products</h2>
      <Controls
        q={q} setQ={setQ}
        min={min} setMin={setMin}
        max={max} setMax={setMax}
        category={category} setCategory={setCategory}
        categories={categories}
        onApply={load}
      />

      <div className="grid grid-4" style={{marginTop:12}}>
        {items.map(p => <ProductCard key={p.id} item={p} />)}
      </div>
    </div>
  )
}
