import { useEffect, useState } from 'react'
import { getClientes, createCliente, deleteCliente } from '../api/clientes'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState({ nombre: '', telefono: '' })

  useEffect(() => { cargar() }, [])
  const cargar = () => getClientes().then(setClientes)

  const guardar = async () => {
    if (!form.nombre) return
    await createCliente(form)
    setForm({ nombre: '', telefono: '' })
    cargar()
  }

  const eliminar = async (id) => { await deleteCliente(id); cargar() }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Clientes</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="font-semibold mb-3 text-gray-700">Agregar Cliente</h2>
        <div className="flex gap-3 flex-wrap">
          <input className="border rounded-lg px-3 py-2 flex-1 min-w-48" placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          <input className="border rounded-lg px-3 py-2 w-44" placeholder="Teléfono" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
          <button onClick={guardar} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Agregar</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 text-left">
            <th className="p-3">ID</th><th className="p-3">Nombre</th><th className="p-3">Teléfono</th><th className="p-3">Acciones</th>
          </tr></thead>
          <tbody>{clientes.map(c => (
            <tr key={c.idCliente} className="border-t hover:bg-gray-50">
              <td className="p-3">{c.idCliente}</td>
              <td className="p-3 font-medium">{c.nombre}</td>
              <td className="p-3">{c.telefono || '—'}</td>
              <td className="p-3"><button onClick={() => eliminar(c.idCliente)} className="text-red-500 hover:text-red-700 text-xs border border-red-300 px-2 py-1 rounded">Eliminar</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}