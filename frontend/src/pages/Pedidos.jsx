import { useEffect, useState } from 'react'
import { getPedidos } from '../api/pedidos'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([])

  useEffect(() => { getPedidos().then(setPedidos) }, [])

  const estadoColor = (e) => {
    if (e === 'Entregado') return 'bg-green-100 text-green-700'
    if (e === 'Pendiente') return 'bg-yellow-100 text-yellow-700'
    if (e === 'Cancelado') return 'bg-red-100 text-red-700'
    if (e === 'En camino') return 'bg-blue-100 text-blue-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Pedidos</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Empleado</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.idPedido} className="border-t hover:bg-gray-50">
                <td className="p-3">#{p.idPedido}</td>
                <td className="p-3 font-medium">{p.cliente?.nombre}</td>
                <td className="p-3">{p.empleado?.nombre}</td>
                <td className="p-3">{p.fecha}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${estadoColor(p.estado)}`}>
                    {p.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}