export default function Navbar() {
  return (
    <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">Sistema de Gestión de Inventarios</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Carlos Mamani</span>
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          CM
        </div>
      </div>
    </header>
  )
}