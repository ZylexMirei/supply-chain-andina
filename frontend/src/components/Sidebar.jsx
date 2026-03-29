import { NavLink } from 'react-router-dom'

const links = [
  { to: '/',              label: 'Dashboard',       icon: '📊' },
  { to: '/productos',     label: 'Productos',        icon: '📦' },
  { to: '/inventario',    label: 'Inventario',       icon: '🏭' },
  { to: '/pedidos',       label: 'Pedidos',          icon: '🛒' },
  { to: '/ordenes-compra',label: 'Órdenes de Compra',icon: '📋' },
  { to: '/clientes',      label: 'Clientes',         icon: '👥' },
  { to: '/proveedores',   label: 'Proveedores',      icon: '🚚' },
  { to: '/almacenes',     label: 'Almacenes',        icon: '🏪' },
  { to: '/compras',       label: 'Compras',          icon: '💳' },
  { to: '/reportes',      label: 'Reportes',         icon: '📈' },
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">Distribuidora</h1>
        <p className="text-xs text-gray-400">Andina S.R.L.</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        Supply Chain v1.0
      </div>
    </div>
  )
}