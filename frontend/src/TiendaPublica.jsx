import { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles, PlusCircle, CupSoda, PackageOpen } from 'lucide-react';

export default function TiendaPublica() {
  const [sugerencias, setSugerencias] = useState([]);
  const [cargandoIA, setCargandoIA] = useState(true);

  // Simulamos que el cliente está viendo el Producto ID 1 (Coca-Cola)
  const idProductoViendo = 1;

  useEffect(() => {
    // Aquí React le pregunta a tu "Cerebro PHP" qué sugerir
    fetch(`http://localhost:8000/api/ia/recomendaciones.php?id=${idProductoViendo}`)
      .then(res => res.json())
      .then(respuesta => {
        if (respuesta.status === 'success') {
          setSugerencias(respuesta.data);
        }
        setCargandoIA(false);
      })
      .catch(err => console.error("Error conectando a la IA:", err));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* EL PRODUCTO PRINCIPAL QUE EL CLIENTE ESTÁ VIENDO */}
      <div className="card-premium" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem' }}>Coca-Cola 2L</h2>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>Bebidas Gaseosas • Refrescante</p>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: '15px 0' }}>Bs. 13.00</h3>
          <button style={{ 
            background: 'var(--primary)', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center', fontWeight: 'bold'
          }}>
            <ShoppingCart size={20} /> Añadir al Carrito
          </button>
        </div>
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.1)', width: '150px', height: '150px', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)'
        }}>
          {/* ICONO SVG PROFESIONAL EN LUGAR DE IMAGEN O EMOJI */}
          <CupSoda size={80} strokeWidth={1.5} />
        </div>
      </div>

      {/* LA MAGIA DE LA IA: SECCIÓN DE CROSS-SELLING */}
      <div className="card-premium" style={{ background: 'var(--bg-card)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0, color: 'var(--text-main)' }}>
          <Sparkles color="#eab308" /> ¿Te gustaría acompañarlo con...?
        </h3>

        {cargandoIA ? (
          <p style={{ color: 'var(--text-dim)' }}>La IA está analizando las mejores opciones para ti...</p>
        ) : sugerencias.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            
            {sugerencias.map((item) => (
              <div key={item.id_producto} style={{ 
                border: '1px solid var(--border)', padding: '1.5rem 1rem', borderRadius: '12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                transition: 'all 0.2s ease', background: 'var(--bg-body)'
              }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '15px', color: 'var(--primary)' }}>
                  {/* ICONO SVG PARA LAS SUGERENCIAS */}
                  <PackageOpen size={32} strokeWidth={1.5} />
                </div>
                <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{item.nombre}</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>{item.marca}</p>
                <p style={{ fontWeight: 'bold', margin: '15px 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>Bs. {item.precio_venta}</p>
                <button style={{ 
                  background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)',
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center',
                  fontWeight: '600', transition: 'all 0.2s'
                }}>
                  <PlusCircle size={18} /> Agregar
                </button>
              </div>
            ))}

          </div>
        ) : (
          <p style={{ color: 'var(--text-dim)' }}>No hay sugerencias disponibles en este momento.</p>
        )}
      </div>

    </div>
  );
}