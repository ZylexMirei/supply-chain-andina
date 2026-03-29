const BASE = 'http://localhost:8080/api'

export const getClientes = () => fetch(`${BASE}/clientes`).then(r => r.json())
export const createCliente = (data) => fetch(`${BASE}/clientes`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const updateCliente = (id, data) => fetch(`${BASE}/clientes/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const deleteCliente = (id) => fetch(`${BASE}/clientes/${id}`, { method: 'DELETE' })
