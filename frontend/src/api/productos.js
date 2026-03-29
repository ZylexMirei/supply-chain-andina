const BASE = 'http://localhost:8080/api'

export const getProductos = () => fetch(`${BASE}/productos`).then(r => r.json())
export const createProducto = (data) => fetch(`${BASE}/productos`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const updateProducto = (id, data) => fetch(`${BASE}/productos/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const deleteProducto = (id) => fetch(`${BASE}/productos/${id}`, { method: 'DELETE' })