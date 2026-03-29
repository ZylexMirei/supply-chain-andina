import { useEffect, useState } from 'react'

const BASE = 'http://localhost:8080/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ productos: 0, clientes: 0, proveedores: 0, alertas: 0 })
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    Promise.all([
      fetch(`${BASE}/productos`).then(r => r.json()),
      fetch(`${BASE}/clientes`).then(r => r.json()),
      fetch(`${BASE}/proveedores`).then(r => r.json()),
      fetch(`${BASE}/inventario/alertas-reorden`).then(r => r.json()),
    ]).then(([productos, clientes, proveedores, alertas]) => {
      setStats({
        productos: productos.length,
        clientes: clientes.length,
        proveedores: proveedores.length,
        alertas: alertas.length,
      })
      setAlertas(alertas.slice(0, 5))
    })
  }, [])

  const cards = [
    { label: 'Productos',    value: stats.productos,   color: 'bg-blue-500',   icon: '📦' },
    { label: 'Clientes',     value: stats.clientes,    color: 'bg-green-500',  icon: '👥' },
    { label: 'Proveedores',  value: stats.proveedores, color: 'bg-purple-500', icon: '🚚' },
    { label: 'Alertas Stock',value: stats.alertas,     color: 'bg-red-500',    icon: '⚠️' },
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${c.color} text-white text-2xl w-14 h-14 rounded-xl flex items-center justify-center`}>
              {c.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alertas de reorden */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-bold text-gray-700 mb-4">⚠️ Alertas de Reorden — Productos bajo stock mínimo</h2>
        {alertas.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay alertas activas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">Producto</th>
                <th className="p-3">Almacén</th>
                <th className="p-3">Stock Actual</th>
                <th className="p-3">Stock Mínimo</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map(a => (
                <tr key={a.idInventario} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{a.producto?.nombre}</td>
                  <td className="p-3">{a.almacen?.ciudad}</td>
                  <td className="p-3 text-red-600 font-bold">{a.cantidad}</td>
                  <td className="p-3">{a.stockMinimo}</td>
                  <td className="p-3">
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
                      Reabastecer
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}