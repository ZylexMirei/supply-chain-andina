import { useEffect, useState } from 'react'

const BASE = 'http://localhost:8080/api'

export default function Inventario() {
  const [inventario, setInventario] = useState([])
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetch(`${BASE}/inventario`).then(r => r.json()).then(setInventario)
  }, [])

  const filtrado = inventario.filter(i =>
    i.producto?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const estadoStock = (cantidad, minimo) => {
    if (cantidad <= minimo) return 'bg-red-100 text-red-700'
    if (cantidad <= minimo * 1.5) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Inventario</h1>
      <div className="bg-white rounded-xl shadow p-4">
        <input
          className="border rounded-lg px-3 py-2 w-full mb-4"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Producto</th>
              <th className="p-3">Almacén</th>
              <th className="p-3">Stock Actual</th>
              <th className="p-3">Mínimo</th>
              <th className="p-3">Máximo</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtrado.map(i => (
              <tr key={i.idInventario} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{i.producto?.nombre}</td>
                <td className="p-3">{i.almacen?.ciudad}</td>
                <td className="p-3 font-bold">{i.cantidad}</td>
                <td className="p-3">{i.stockMinimo}</td>
                <td className="p-3">{i.stockMaximo}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${estadoStock(i.cantidad, i.stockMinimo)}`}>
                    {i.cantidad <= i.stockMinimo ? 'Crítico' : i.cantidad <= i.stockMinimo * 1.5 ? 'Bajo' : 'Normal'}
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