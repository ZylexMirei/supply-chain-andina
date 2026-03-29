import { useEffect, useState } from 'react'
import { getPedidos } from '../api/pedidos'

const BASE = 'http://localhost:8080/api'
const getOrdenes = () => fetch(`${BASE}/ordenes-compra`).then(r => r.json())

export default function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState([])

  useEffect(() => { getOrdenes().then(setOrdenes) }, [])

  const estadoColor = (e) => {
    if (e === 'Completada') return 'bg-green-100 text-green-700'
    if (e === 'Pendiente') return 'bg-yellow-100 text-yellow-700'
    if (e === 'Cancelada') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Órdenes de Compra</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="p-3">ID</th><th className="p-3">Proveedor</th><th className="p-3">Empleado</th><th className="p-3">Fecha</th><th className="p-3">Estado</th>
          </tr></thead>
          <tbody>{ordenes.map(o => (
            <tr key={o.idOrden} className="border-t hover:bg-gray-50">
              <td className="p-3">{o.idOrden}</td>
              <td className="p-3 font-medium">{o.proveedor?.nombre}</td>
              <td className="p-3">{o.empleado?.nombre}</td>
              <td className="p-3">{o.fecha}</td>
              <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor(o.estado)}`}>{o.estado}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}