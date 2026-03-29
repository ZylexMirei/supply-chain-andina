import { useEffect, useState } from 'react'
import { getProductos, createProducto, deleteProducto } from '../api/productos'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState({ nombre: '', precioBase: '' })
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => { cargar() }, [])

  const cargar = () => getProductos().then(setProductos)

  const guardar = async () => {
    if (!form.nombre || !form.precioBase) return
    await createProducto({ nombre: form.nombre, precioBase: parseFloat(form.precioBase), categoria: { idCategoria: 1 } })
    setForm({ nombre: '', precioBase: '' })
    cargar()
  }

  const eliminar = async (id) => { await deleteProducto(id); cargar() }

  const filtrados = productos.filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Productos</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="font-semibold mb-3 text-gray-700">Agregar Producto</h2>
        <div className="flex gap-3 flex-wrap">
          <input className="border rounded-lg px-3 py-2 flex-1 min-w-48" placeholder="Nombre del producto" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          <input className="border rounded-lg px-3 py-2 w-40" placeholder="Precio base (Bs)" type="number" value={form.precioBase} onChange={e => setForm({...form, precioBase: e.target.value})} />
          <button onClick={guardar} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Agregar</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <input className="border rounded-lg px-3 py-2 w-full mb-4" placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="p-3">ID</th><th className="p-3">Nombre</th><th className="p-3">Categoría</th><th className="p-3">Precio Base</th><th className="p-3">Acciones</th>
          </tr></thead>
          <tbody>{filtrados.map(p => (
            <tr key={p.idProducto} className="border-t hover:bg-gray-50">
              <td className="p-3">{p.idProducto}</td>
              <td className="p-3 font-medium">{p.nombre}</td>
              <td className="p-3">{p.categoria?.nombre}</td>
              <td className="p-3">Bs {p.precioBase}</td>
              <td className="p-3"><button onClick={() => eliminar(p.idProducto)} className="text-red-500 hover:text-red-700 text-xs border border-red-300 px-2 py-1 rounded">Eliminar</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}