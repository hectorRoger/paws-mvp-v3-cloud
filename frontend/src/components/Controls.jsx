/* @jsxImportSource react */
import React from 'react'
export default function Controls({ q, setQ, min, setMin, max, setMax, category, setCategory, categories, onApply }){
  return (
    <div className="card" style={{margin:'12px 0'}}>
      <div className="controls">
        <input placeholder="Search name or description..." value={q} onChange={(e)=>setQ(e.target.value)} style={{minWidth:240}} />
        <input type="number" placeholder="Min price" value={min} onChange={(e)=>setMin(e.target.value)} style={{width:120}} />
        <input type="number" placeholder="Max price" value={max} onChange={(e)=>setMax(e.target.value)} style={{width:120}} />
        <select value={category} onChange={(e)=>setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn" onClick={onApply}>Apply</button>
      </div>
    </div>
  )
}
