import { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles, PlusCircle, Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export default function TiendaPublica({ onLoginClick, onRegisterClick }) {
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoIA, setCargandoIA] = useState(true);
  const [errorIA, setErrorIA] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  useEffect(() => {
    fetch(`${API_BASE}/productos/listar.php`)
      .then((res) => res.json())
      .then((respuesta) => {
        if (respuesta.status === 'success') {
          setProductos(respuesta.data || []);
          setErrorProductos('');
        } else {
          setErrorProductos('No se pudo cargar el catálogo.');
        }
      })
      .catch(() => {
        setErrorProductos('Error de conexión al cargar productos.');
      })
      .finally(() => setCargandoProductos(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/ia/recomendaciones.php?id=1`)
      .then((res) => res.json())
      .then((respuesta) => {
        if (respuesta.status === 'success') {
          setSugerencias(respuesta.data);
          setErrorIA('');
        } else {
          setErrorIA('No se pudieron cargar recomendaciones.');
        }
      })
      .catch(() => {
        setErrorIA('Error de conexión al cargar recomendaciones.');
      })
      .finally(() => setCargandoIA(false));
  }, []);

  const categorias = ['Todas', ...new Set(productos.map((item) => item.categoria).filter(Boolean))];
  const productosFiltrados = productos.filter((item) => {
    const coincideCategoria = categoriaActiva === 'Todas' || item.categoria === categoriaActiva;
    const texto = `${item.nombre} ${item.marca} ${item.categoria}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const productosDestacados = productosFiltrados.slice(0, 12);

  return (
    <div className="market-shell">
      <div className="market-topbar">
        <div className="market-logo">Andina Market</div>
        <div className="market-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="¿Que estas buscando?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="market-login-actions">
          <button type="button" onClick={onLoginClick}>Iniciar sesion</button>
          <button type="button" className="register" onClick={onRegisterClick}>Registrarse</button>
        </div>
      </div>

      <div className="market-cats">
        {categorias.map((categoria) => (
          <button
            key={categoria}
            type="button"
            className={categoriaActiva === categoria ? 'active' : ''}
            onClick={() => setCategoriaActiva(categoria)}
          >
            {categoria}
          </button>
        ))}
      </div>

      <div className="market-banner">
        <h2>Mercado Inteligente</h2>
        <p>{productos.length} productos conectados a inventario en tiempo real</p>
      </div>

      <div className="market-section-head">
        <h3>Productos destacados</h3>
        <span>{productosDestacados.length} visibles</span>
      </div>

      {cargandoProductos ? (
        <p className="ia-message">Cargando catálogo...</p>
      ) : errorProductos ? (
        <p className="ia-message error">{errorProductos}</p>
      ) : (
        <div className="market-grid">
          {productosDestacados.map((item) => (
            <article key={item.id_producto} className="product-card">
              <span className={`stock-badge ${item.estado_stock?.toLowerCase()}`}>{item.estado_stock}</span>
              <div className="product-image-placeholder" />
              <h4>{item.nombre}</h4>
              <p className="brand-name">{item.marca} · {item.categoria}</p>
              <p>Bs. {item.precio_venta}</p>
              <button type="button"><ShoppingCart size={16} /> Agregar</button>
            </article>
          ))}
        </div>
      )}

      <div className="ia-section card-premium">
        <h3 className="ia-title">
          <Sparkles color="#eab308" /> Recomendado por IA
        </h3>

        {cargandoIA ? (
          <p className="ia-message">La IA está analizando las mejores opciones para ti...</p>
        ) : errorIA ? (
          <p className="ia-message error">{errorIA}</p>
        ) : sugerencias.length > 0 ? (
          <div className="ia-grid">
            {sugerencias.map((item) => (
              <div key={item.id_producto} className="ia-card">
                <h4>{item.nombre}</h4>
                <p className="brand-name">{item.marca}</p>
                <p className="price">Bs. {item.precio_venta}</p>
                <button type="button">
                  <PlusCircle size={18} /> Agregar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="ia-message">No hay sugerencias disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
}
