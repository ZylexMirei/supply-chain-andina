const BASE = 'http://localhost:8080/api'

export const getPedidos = () => fetch(`${BASE}/pedidos`).then(r => r.json())
export const createPedido = (data) => fetch(`${BASE}/pedidos`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const updatePedido = (id, data) => fetch(`${BASE}/pedidos/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())