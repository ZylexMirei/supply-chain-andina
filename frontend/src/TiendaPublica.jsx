import { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles, PlusCircle, Search } from 'lucide-react';
import { getJson } from './lib/api.js';
import { getProductImageUrl } from './data/product-image-urls.js';

function ProductSkeleton() {
  return (
    <article className="product-card skeleton" aria-hidden="true">
      <span className="stock-badge normal skeleton-pill" />
      <div className="product-image-placeholder skeleton-box" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
      <div className="skeleton-line" />
      <button type="button" className="skeleton-btn" tabIndex={-1} aria-hidden="true" />
    </article>
  );
}

export default function TiendaPublica({ onLoginClick, onRegisterClick, usuarioActivo }) {
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(true);
  const [errorProductos, setErrorProductos] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoIA, setCargandoIA] = useState(true);
  const [errorIA, setErrorIA] = useState('');
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');

  useEffect(() => {
    let alive = true;
    getJson('/productos/listar.php')
      .then((respuesta) => {
        if (!alive) return;
        if (respuesta?.status === 'success') {
          setProductos(respuesta.data || []);
        } else {
          setErrorProductos(respuesta?.message || 'No se pudo cargar el catálogo.');
        }
      })
      .catch((err) => {
        if (!alive) return;
        setErrorProductos(err?.message || 'Error de conexión al cargar productos.');
      })
      .finally(() => {
        if (!alive) return;
        setCargandoProductos(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    getJson('/ia/recomendaciones.php?id=1')
      .then((respuesta) => {
        if (!alive) return;
        if (respuesta?.status === 'success') {
          setSugerencias(respuesta.data || []);
        } else {
          setErrorIA(respuesta?.message || 'No se pudieron cargar recomendaciones.');
        }
      })
      .catch((err) => {
        if (!alive) return;
        setErrorIA(err?.message || 'Error de conexión al cargar recomendaciones.');
      })
      .finally(() => {
        if (!alive) return;
        setCargandoIA(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const categorias = ['Todas', ...new Set(productos.map((item) => item.categoria).filter(Boolean))];
  const productosFiltrados = productos.filter((item) => {
    const coincideCategoria = categoriaActiva === 'Todas' || item.categoria === categoriaActiva;
    const texto = `${item.nombre} ${item.marca} ${item.categoria}`.toLowerCase();
    const coincideBusqueda = texto.includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  const productosDestacados = productosFiltrados.slice(0, 12);
  const fallbackImageFor = (item) =>
    `https://picsum.photos/seed/andina-${encodeURIComponent(item?.id_producto ?? item?.nombre ?? 'producto')}/480/360`;

  const handleAgregar = (item) => {
    const stock = Number(item?.stock_actual ?? 0);
    if (!usuarioActivo) {
      setMensajeAccion('Para agregar productos al carrito primero debes iniciar sesión o registrarte.');
      onLoginClick?.();
      return;
    }
    if (!Number.isFinite(stock) || stock <= 0) {
      setMensajeAccion('Este producto no tiene stock disponible por el momento.');
      return;
    }
    setMensajeAccion(`"${item.nombre}" listo para agregar. Próximo paso: conectar carrito del cliente.`);
  };

  return (
    <div className="market-shell">
      <div className="market-topbar">
        <div className="market-logo">Andina Market</div>
        <div className="market-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="market-login-actions">
          <button type="button" onClick={onLoginClick}>Iniciar sesión</button>
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
      {mensajeAccion ? <div className="market-inline-note">{mensajeAccion}</div> : null}

      {cargandoProductos ? (
        <div className="market-grid" aria-label="Cargando catálogo">
          {Array.from({ length: 8 }).map((_, idx) => <ProductSkeleton key={idx} />)}
        </div>
      ) : errorProductos ? (
        <div className="empty-state">
          <p className="ia-message error">{errorProductos}</p>
          <p className="ia-message">Verifica que el backend esté corriendo y que `VITE_API_BASE_URL` apunte bien.</p>
        </div>
      ) : productosDestacados.length === 0 ? (
        <div className="empty-state">
          <p className="ia-message">No hay productos para mostrar con estos filtros.</p>
          <p className="ia-message">Prueba otra categoría o borra la búsqueda.</p>
        </div>
      ) : (
        <div className="market-grid">
          {productosDestacados.map((item) => {
            const imageUrl = getProductImageUrl(item);
            const stockActual = Number(item.stock_actual ?? 0);
            const sinStock = !Number.isFinite(stockActual) || stockActual <= 0;
            const requiereLogin = !usuarioActivo;
            const deshabilitarAgregar = sinStock;
            const textoBoton = sinStock ? 'Sin stock' : 'Agregar';
            return (
              <article key={item.id_producto} className="product-card">
                <span className={`stock-badge ${item.estado_stock?.toLowerCase()}`}>{item.estado_stock}</span>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.nombre || 'Producto'}
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      const fallback = fallbackImageFor(item);
                      if (img.dataset.fallbackApplied === '1') {
                        img.style.display = 'none';
                        img.nextElementSibling?.classList.remove('hidden');
                        return;
                      }
                      img.dataset.fallbackApplied = '1';
                      img.src = fallback;
                    }}
                  />
                ) : null}
                <div className={`product-image-placeholder ${imageUrl ? 'hidden' : ''}`} />
                <h4>{item.nombre}</h4>
                <p className="brand-name">{item.marca} · {item.categoria}</p>
                <p className="stock-text">Stock: {stockActual}</p>
                <p>Bs. {item.precio_venta}</p>
                <button
                  type="button"
                  className="soft-btn"
                  onClick={() => handleAgregar(item)}
                  disabled={deshabilitarAgregar}
                  title={requiereLogin ? 'Inicia sesión para comprar' : 'Agregar al carrito'}
                >
                  <ShoppingCart size={16} /> {textoBoton}
                </button>
                {requiereLogin && !sinStock ? <p className="login-hint">Necesitas iniciar sesión para comprar.</p> : null}
              </article>
            );
          })}
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
