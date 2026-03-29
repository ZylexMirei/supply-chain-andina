import { useEffect, useState } from 'react'
import { getProveedores, createProveedor } from '../api/proveedores'

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [form, setForm] = useState({ nombre: '', telefono: '', pais: '' })

  useEffect(() => { cargar() }, [])
  const cargar = () => getProveedores().then(setProveedores)

  const guardar = async () => {
    if (!form.nombre) return
    await createProveedor(form)
    setForm({ nombre: '', telefono: '', pais: '' })
    cargar()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Proveedores</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="font-semibold mb-3 text-gray-700">Agregar Proveedor</h2>
        <div className="flex gap-3 flex-wrap">
          <input className="border rounded-lg px-3 py-2 flex-1 min-w-48" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          <input className="border rounded-lg px-3 py-2 w-40" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
          <input className="border rounded-lg px-3 py-2 w-36" placeholder="País" value={form.pais} onChange={e => setForm({...form, pais: e.target.value})} />
          <button onClick={guardar} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Agregar</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="p-3">ID</th><th className="p-3">Nombre</th><th className="p-3">Teléfono</th><th className="p-3">País</th>
          </tr></thead>
          <tbody>{proveedores.map(p => (
            <tr key={p.idProveedor} className="border-t hover:bg-gray-50">
              <td className="p-3">{p.idProveedor}</td>
              <td className="p-3 font-medium">{p.nombre}</td>
              <td className="p-3">{p.telefono || '—'}</td>
              <td className="p-3">{p.pais || '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}