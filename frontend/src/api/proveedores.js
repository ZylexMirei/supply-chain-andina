const BASE = 'http://localhost:8080/api'

export const getProveedores = () => fetch(`${BASE}/proveedores`).then(r => r.json())

export const createProveedor = (data) => fetch(`${BASE}/proveedores`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(r => r.json())

export const updateProveedor = (id, data) => fetch(`${BASE}/proveedores/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(r => r.json())