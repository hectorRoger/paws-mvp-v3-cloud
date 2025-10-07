/* @jsxImportSource react */
import React from 'react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ItemForm from '../components/ItemForm.jsx'
import ProductCard from '../components/ProductCard.jsx'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export default function Admin(){
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [auth, setAuth] = useState(!!token)
  const [items, setItems] = useState([])
  const [editItem, setEditItem] = useState(null)

  async function login(e){
    e.preventDefault()
    const username = e.target.username.value
    const password = e.target.password.value
    try{
      const r = await axios.post(`${API}/login`, {username, password})
      localStorage.setItem('token', r.data.token)
      setToken(r.data.token)
      setAuth(true)
    }catch(err){
      alert('Login failed')
    }
  }

  async function load(){
    const r = await axios.get(`${API}/items`)
    setItems(r.data)
  }
  useEffect(()=>{ if(auth) load() }, [auth])

  async function createItem(payload){
    await axios.post(`${API}/items`, payload)
    setEditItem(null)
    load()
  }
  async function updateItem(payload){
    await axios.put(`${API}/items/${payload.id}`, payload)
    setEditItem(null)
    load()
  }
  async function deleteItem(it){
    if(!confirm('Delete item?')) return
    await axios.delete(`${API}/items/${it.id}`)
    load()
  }

  if(!auth){
    return (
      <div className="container" style={{maxWidth:420}}>
        <h2 style={{marginTop:16}}>Admin Login</h2>
        <form onSubmit={login} className="card">
          <div>
            <label>Username</label>
            <input name="username" defaultValue="admin" />
          </div>
          <div>
            <label>Password</label>
            <input type="password" name="password" defaultValue="admin123" />
          </div>
          <button className="btn primary" type="submit" style={{marginTop:8}}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div className="container">
      <h2 style={{marginTop:16}}>Admin Panel</h2>
      <p>Manage products, bundles, and services. Data is persisted to Postgres in the cloud, or <code>backend/data.json</code> locally.</p>

      <h3 style={{marginTop:12}}>Create / Edit Item</h3>
      <ItemForm
        initial={editItem}
        onSubmit={(payload)=> editItem ? updateItem(payload) : createItem(payload)}
        onCancel={()=> setEditItem(null)}
      />

      <h3 style={{marginTop:16}}>All Items</h3>
      <div className="grid grid-4" style={{marginTop:12}}>
        {items.map(it =>
          <ProductCard key={it.id} item={it} onEdit={setEditItem} onDelete={deleteItem} />
        )}
      </div>
    </div>
  )
}
