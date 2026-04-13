import { useState, useContext } from 'react';
import { Mail, Lock, LogIn, Sun, Moon, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react';
import { ThemeContext } from './context/ThemeContext'; // Importamos el motor visual
import TiendaPublica from './TiendaPublica';
import './App.css';

function App() {
  // Sacamos las herramientas del contexto
  const { tema, toggleTema } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [paso, setPaso] = useState('LOGIN'); 
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [usuarioActivo, setUsuarioActivo] = useState(null);

  // Funciones de Login (Sin cambios)
  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    try {
      const response = await fetch('http://localhost:8000/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsuarioActivo(data.user);
        setPaso('DASHBOARD');
      } else if (data.status === 'pending_verification') {
        setMensaje({ tipo: 'success', texto: data.message });
        setPaso('OTP');
      } else {
        setMensaje({ tipo: 'error', texto: data.message });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleVerificar = async (e) => { /* ... (Tu código de verificar se queda igual) ... */ };

  return (
    <div>
      {/* EL BOTÓN MÁGICO FLOTANTE */}
      <button 
        className="theme-toggle-btn" 
        onClick={toggleTema}
        title="Cambiar Tema"
      >
        {tema === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      {/* --- PANTALLAS --- */}

      {paso === 'TIENDA' && (
        <div className="dashboard-container">
           <button 
            onClick={() => setPaso('LOGIN')} 
            style={{ marginBottom: '2rem', padding: '10px 15px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}
          >
            ⬅️ Volver al Sistema
          </button>
          <TiendaPublica /> 
        </div>
      )}

      {paso === 'DASHBOARD' && (
        <div className="dashboard-container">
          <div className="header-principal">
            <div>
              <h1 style={{ margin: 0 }}>Panel de Control Inteligente</h1>
              <p style={{ color: 'var(--text-dim)', margin: '5px 0' }}>Bienvenida, {usuarioActivo.nombre} ({usuarioActivo.rol})</p>
            </div>
            <button 
              onClick={() => setPaso('LOGIN')}
              style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cerrar Sesión
            </button>
          </div>
          
          <div className="grid-metricas">
             {/* Tarjetas de ejemplo con los nuevos estilos */}
            <div className="card-premium">
              <div className="metrica-header">
                <div className="metrica-icono"><DollarSign size={24}/></div>
                <h3 style={{ color: 'var(--text-dim)', margin: 0, fontSize: '1rem' }}>Ingresos Hoy</h3>
              </div>
              <p className="metrica-valor">Bs. 4,500</p>
            </div>

            <div className="card-premium">
              <div className="metrica-header">
                <div className="metrica-icono danger"><AlertTriangle size={24}/></div>
                <h3 style={{ color: 'var(--text-dim)', margin: 0, fontSize: '1rem' }}>Alertas ROP</h3>
              </div>
              <p className="metrica-valor" style={{ color: 'var(--danger)' }}>3 Críticos</p>
            </div>
          </div>
        </div>
      )}

      {paso === 'LOGIN' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-body)' }}>
          <div className="card-premium" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Sistema SCM 🏢</h2>
            {mensaje.texto && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{mensaje.texto}</div>}
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Correo Electrónico:</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-body)', border: `1px solid var(--border)`, color: 'var(--text-main)', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Contraseña:</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-body)', border: `1px solid var(--border)`, color: 'var(--text-main)', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Ingresar
              </button>
            </form>

            <hr style={{ margin: '20px 0', borderColor: 'var(--border)' }} />
            <button 
              type="button" 
              onClick={() => setPaso('TIENDA')} 
              style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <ShoppingCart size={18}/> Ver Tienda Pública
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;