import { useEffect, useState } from 'react'

const BASE = 'http://localhost:8080/api'

export default function Almacenes() {
  const [inventario, setInventario] = useState([])
  const [almacenSel, setAlmacenSel] = useState('todos')

  useEffect(() => {
    fetch(`${BASE}/inventario`).then(r => r.json()).then(setInventario)
  }, [])

  const almacenes = [...new Set(inventario.map(i => i.almacen?.ciudad).filter(Boolean))]

  const filtrado = almacenSel === 'todos'
    ? inventario
    : inventario.filter(i => i.almacen?.ciudad === almacenSel)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Almacenes</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setAlmacenSel('todos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${almacenSel === 'todos' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 shadow'}`}
        >
          Todos
        </button>
        {almacenes.map(a => (
          <button
            key={a}
            onClick={() => setAlmacenSel(a)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${almacenSel === a ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 shadow'}`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-3">Producto</th>
              <th className="p-3">Almacén</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Mínimo</th>
            </tr>
          </thead>
          <tbody>
            {filtrado.map(i => (
              <tr key={i.idInventario} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{i.producto?.nombre}</td>
                <td className="p-3">{i.almacen?.ciudad}</td>
                <td className="p-3">{i.cantidad}</td>
                <td className="p-3">{i.stockMinimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}