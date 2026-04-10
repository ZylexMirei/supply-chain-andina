import { useState, useEffect } from 'react';
import { ShoppingCart, Sparkles, PlusCircle } from 'lucide-react';
import './App.css'; // Usamos los mismos estilos del Sol y Luna

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
    <div className="dashboard-container" style={{ maxWidth: '800px' }}>
      
      {/* EL PRODUCTO PRINCIPAL QUE EL CLIENTE ESTÁ VIENDO */}
      <div className="tarjeta-metrica" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem' }}>Coca-Cola 2L</h2>
          <p style={{ color: 'var(--texto-secundario)', margin: 0 }}>Bebidas Gaseosas • Refrescante</p>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primario)', margin: '15px 0' }}>Bs. 13.00</h3>
          <button style={{ 
            background: 'var(--color-primario)', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '10px'
          }}>
            <ShoppingCart size={20} /> Añadir al Carrito
          </button>
        </div>
        <div style={{ 
          background: 'var(--borde)', width: '150px', height: '150px', 
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          🛒 /* Aquí iría la foto real de la Coca-Cola */
        </div>
      </div>

      {/* LA MAGIA DE LA IA: SECCIÓN DE CROSS-SELLING */}
      <div style={{ background: 'var(--bg-tarjeta)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--borde)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 0 }}>
          <Sparkles color="#eab308" /> ¿Te gustaría acompañarlo con...?
        </h3>

        {cargandoIA ? (
          <p>La IA está analizando las mejores opciones para ti...</p>
        ) : sugerencias.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            
            {sugerencias.map((item) => (
              <div key={item.id_producto} style={{ 
                border: '1px solid var(--borde)', padding: '1rem', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
              }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderRadius: '50%', marginBottom: '10px' }}>
                  🍟
                </div>
                <h4 style={{ margin: '0 0 5px 0' }}>{item.nombre}</h4>
                <p style={{ color: 'var(--texto-secundario)', fontSize: '0.9rem', margin: 0 }}>{item.marca}</p>
                <p style={{ fontWeight: 'bold', margin: '10px 0' }}>Bs. {item.precio_venta}</p>
                <button style={{ 
                  background: 'transparent', border: '1px solid var(--color-primario)', color: 'var(--color-primario)',
                  padding: '5px 15px', borderRadius: '20px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center'
                }}>
                  <PlusCircle size={16} /> Agregar
                </button>
              </div>
            ))}

          </div>
        ) : (
          <p style={{ color: 'var(--texto-secundario)' }}>No hay sugerencias disponibles en este momento.</p>
        )}
      </div>

    </div>
  );
}