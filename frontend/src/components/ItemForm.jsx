/* @jsxImportSource react */
import React from 'react'
import { useState, useEffect } from 'react'

const blank = {
  type: 'product',
  name: '', category: '', subcategory: '',
  price: 0, stock: 0, image: '', description: ''
}

export default function ItemForm({initial, onSubmit, onCancel}){
  const [item, setItem] = useState(initial || blank)

  useEffect(()=>{ setItem(initial || blank) }, [initial])

  const handle = (e)=> setItem({...item, [e.target.name]: e.target.value})

  const submit = (e)=>{
    e.preventDefault()
    const payload = {...item, price: Number(item.price), stock: item.stock === '' ? null : Number(item.stock)}
    onSubmit && onSubmit(payload)
  }

  return (
    <form onSubmit={submit} className="card">
      <div className="row">
        <div style={{flex:1}}>
          <label>Type</label>
          <select name="type" value={item.type} onChange={handle}>
            <option value="product">product</option>
            <option value="service">service</option>
            <option value="bundle">bundle</option>
          </select>
        </div>
        <div style={{flex:2}}>
          <label>Name</label>
          <input name="name" value={item.name} onChange={handle} required />
        </div>
      </div>
      <div className="row">
        <div style={{flex:1}}>
          <label>Category</label>
          <input name="category" value={item.category} onChange={handle} placeholder="Dogs/Cats/Birds/Fish/Services" required />
        </div>
        <div style={{flex:1}}>
          <label>Subcategory</label>
          <input name="subcategory" value={item.subcategory} onChange={handle} />
        </div>
      </div>
      <div className="row">
        <div style={{flex:1}}>
          <label>Price (RWF)</label>
          <input name="price" type="number" value={item.price} onChange={handle} />
        </div>
        <div style={{flex:1}}>
          <label>Stock</label>
          <input name="stock" type="number" value={item.stock} onChange={handle} />
        </div>
      </div>
      <div>
        <label>Image URL</label>
        <input name="image" value={item.image} onChange={handle} placeholder="https://..."/>
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" rows="3" value={item.description} onChange={handle}/>
      </div>
      <div className="row" style={{marginTop:8}}>
        <button className="btn primary" type="submit">Save</button>
        {onCancel && <button className="btn" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  )
}
