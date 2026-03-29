import { useEffect, useState } from 'react'

const BASE = 'http://localhost:8080/api'

export default function Reportes() {
  const [alertas, setAlertas] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [ordenes, setOrdenes] = useState([])

  useEffect(() => {
    fetch(`${BASE}/inventario/alertas-reorden`).then(r => r.json()).then(setAlertas)
    fetch(`${BASE}/pedidos`).then(r => r.json()).then(setPedidos)
    fetch(`${BASE}/ordenes-compra`).then(r => r.json()).then(setOrdenes)
  }, [])

  const pedidosEntregados = pedidos.filter(p => p.estado === 'Entregado').length
  const pedidosPendientes = pedidos.filter(p => p.estado === 'Pendiente').length
  const ordenesCompletadas = ordenes.filter(o => o.estado === 'Completada').length

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Reportes</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{alertas.length}</p>
          <p className="text-sm text-gray-500">Alertas de stock</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{pedidosEntregados}</p>
          <p className="text-sm text-gray-500">Pedidos entregados</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-yellow-500">{pedidosPendientes}</p>
          <p className="text-sm text-gray-500">Pedidos pendientes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-500">{ordenesCompletadas}</p>
          <p className="text-sm text-gray-500">Compras completadas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-bold text-gray-700 mb-4">⚠️ Productos que necesitan reabastecimiento</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Producto</th>
              <th className="p-3">Almacén</th>
              <th className="p-3">Stock Actual</th>
              <th className="p-3">Stock Mínimo</th>
              <th className="p-3">Déficit</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map(a => (
              <tr key={a.idInventario} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{a.producto?.nombre}</td>
                <td className="p-3">{a.almacen?.ciudad}</td>
                <td className="p-3 text-red-600 font-bold">{a.cantidad}</td>
                <td className="p-3">{a.stockMinimo}</td>
                <td className="p-3 text-red-500 font-medium">-{a.stockMinimo - a.cantidad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}