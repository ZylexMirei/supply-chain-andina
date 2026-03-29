import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Productos from './pages/Productos'
import Inventario from './pages/Inventario'
import Pedidos from './pages/Pedidos'
import Clientes from './pages/Clientes'
import Proveedores from './pages/Proveedores'
import OrdenesCompra from './pages/OrdenesCompra'
import Almacenes from './pages/Almacenes'
import Reportes from './pages/Reportes'
import Compras from './pages/Compras'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="ordenes-compra" element={<OrdenesCompra />} />
          <Route path="almacenes" element={<Almacenes />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="compras" element={<Compras />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App