/* @jsxImportSource react */
import React from 'react'
export default function ProductCard({item, onEdit, onDelete}){
  return (
    <div className="card">
      <img
        src={item.image}
        alt={item.name}
        onError={(e)=>{ e.currentTarget.src =
          item.category === 'Dogs' ? 'https://placedog.net/600/400?id=999'
          : item.category === 'Cats' ? 'https://placekitten.com/600/400'
          : 'https://picsum.photos/id/1025/600/400.jpg'
        }}
      />
      <div style={{fontWeight:600, marginTop:8}}>{item.name}</div>
      <div style={{color:'#6b7280', fontSize:14}}>{item.category} • {item.subcategory}</div>
      {typeof item.price === 'number' && <div style={{fontWeight:700, marginTop:6}}>{item.price.toLocaleString()} RWF</div>}
      {typeof item.stock === 'number' && <div style={{fontSize:12, color:'#6b7280'}}>In stock: {item.stock}</div>}
      <div style={{marginTop:8, fontSize:14}}>{item.description}</div>
      {(onEdit || onDelete) && (
        <div className="row" style={{marginTop:8}}>
          {onEdit && <button className="btn" onClick={()=>onEdit(item)}>Edit</button>}
          {onDelete && <button className="btn" onClick={()=>onDelete(item)}>Delete</button>}
        </div>
      )}
    </div>
  )
}
