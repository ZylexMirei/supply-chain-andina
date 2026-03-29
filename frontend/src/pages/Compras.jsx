import { useEffect, useState } from 'react'

const BASE = 'http://localhost:8080/api'

export default function Compras() {
  const [ordenes, setOrdenes] = useState([])

  useEffect(() => {
    fetch(`${BASE}/ordenes-compra`).then(r => r.json()).then(setOrdenes)
  }, [])

  const total = ordenes.length
  const pendientes = ordenes.filter(o => o.estado === 'Pendiente').length
  const completadas = ordenes.filter(o => o.estado === 'Completada').length

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Compras</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{total}</p>
          <p className="text-sm text-gray-500">Total órdenes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-yellow-500">{pendientes}</p>
          <p className="text-sm text-gray-500">Pendientes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{completadas}</p>
          <p className="text-sm text-gray-500">Completadas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Proveedor</th>
              <th className="p-3">Empleado</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map(o => (
              <tr key={o.idOrden} className="border-t hover:bg-gray-50">
                <td className="p-3">#{o.idOrden}</td>
                <td className="p-3 font-medium">{o.proveedor?.nombre}</td>
                <td className="p-3">{o.empleado?.nombre}</td>
                <td className="p-3">{o.fecha}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    o.estado === 'Completada' ? 'bg-green-100 text-green-700' :
                    o.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{o.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}