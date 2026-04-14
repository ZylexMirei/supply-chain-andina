import { useState, useContext } from 'react';
import { Sun, Moon, DollarSign, AlertTriangle, ShieldCheck, UserRound, Warehouse, BarChart3, X } from 'lucide-react';
import { ThemeContext } from './context/theme-context';
import TiendaPublica from './TiendaPublica';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const CLIENT_REGISTER_ENDPOINT = import.meta.env.VITE_CLIENT_REGISTER_ENDPOINT || `${API_BASE}/registro_cliente.php`;

const VISTAS = { HOME: 'HOME', OTP: 'OTP', DASHBOARD: 'DASHBOARD' };

function normalizarRol(rol = '') {
  return String(rol).trim().toLowerCase();
}

function configDashboardPorRol(rol) {
  const rolNorm = normalizarRol(rol);
  if (rolNorm.includes('admin')) return { titulo: 'Dashboard Administrador', subtitulo: 'Control general del sistema.', icono: <ShieldCheck size={24} />, metricas: [{ etiqueta: 'Usuarios activos', valor: '42' }, { etiqueta: 'Alertas', valor: '3' }] };
  if (rolNorm.includes('almacen')) return { titulo: 'Dashboard Almacenero', subtitulo: 'Gestión de inventario.', icono: <Warehouse size={24} />, metricas: [{ etiqueta: 'Bajo ROP', valor: '8' }, { etiqueta: 'Compras pendientes', valor: '5' }] };
  if (rolNorm.includes('gerente')) return { titulo: 'Dashboard Gerencial', subtitulo: 'Visión comercial y operativa.', icono: <BarChart3 size={24} />, metricas: [{ etiqueta: 'Ingresos hoy', valor: 'Bs. 4,500' }, { etiqueta: 'Pedidos pendientes', valor: '12' }] };
  if (rolNorm.includes('cliente')) return { titulo: 'Dashboard Cliente', subtitulo: 'Tus pedidos y compras.', icono: <UserRound size={24} />, metricas: [{ etiqueta: 'Pedidos activos', valor: '2' }, { etiqueta: 'Última compra', valor: 'Bs. 130' }] };
  return { titulo: 'Dashboard General', subtitulo: 'Panel según permisos.', icono: <BarChart3 size={24} />, metricas: [{ etiqueta: 'Estado', valor: 'Operativo' }, { etiqueta: 'Rol', valor: rol || 'Sin rol' }] };
}

function App() {
  const { tema, toggleTema } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [vista, setVista] = useState(VISTAS.HOME);
  const [authMode, setAuthMode] = useState('login');
  const [showAuth, setShowAuth] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const abrirLogin = () => {
    setMensaje({ tipo: '', texto: '' });
    setAuthMode('login');
    setShowAuth(true);
  };

  const abrirRegistro = () => {
    setMensaje({ tipo: '', texto: '' });
    setAuthMode('register');
    setShowAuth(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await response.json();
      if (!response.ok) return setMensaje({ tipo: 'error', texto: data.message || 'No se pudo iniciar sesion.' });
      if (data.status === 'success') {
        setUsuarioActivo(data.user);
        setVista(VISTAS.DASHBOARD);
        setShowAuth(false);
      } else if (data.status === 'pending_verification') {
        setMensaje({ tipo: 'success', texto: data.message });
        setVista(VISTAS.OTP);
        setShowAuth(false);
      } else setMensaje({ tipo: 'error', texto: data.message || 'No se pudo iniciar sesion.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexion' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistroCliente = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    setIsLoading(true);
    try {
      const response = await fetch(CLIENT_REGISTER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreCliente, telefono: telefonoCliente, email, password }),
      });
      const data = await response.json();
      if (!response.ok) return setMensaje({ tipo: 'error', texto: data.message || 'No se pudo registrar.' });
      setMensaje({ tipo: 'success', texto: data.message || 'Registro exitoso. Ahora inicia sesion.' });
      setNombreCliente('');
      setTelefonoCliente('');
      setPassword('');
      setAuthMode('login');
    } catch {
      setMensaje({ tipo: 'error', texto: 'Endpoint de registro no disponible.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/verificar_codigo.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, codigo }) });
      const data = await response.json();
      if (!response.ok) return setMensaje({ tipo: 'error', texto: data.message || 'No se pudo verificar el codigo.' });
      if (data.status === 'success') {
        setUsuarioActivo(data.user);
        setVista(VISTAS.DASHBOARD);
      } else setMensaje({ tipo: 'error', texto: data.message || 'Codigo invalido.' });
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error de conexion al verificar codigo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
    setPassword('');
    setCodigo('');
    setVista(VISTAS.HOME);
    setShowAuth(false);
  };

  const dashboardConfig = configDashboardPorRol(usuarioActivo?.rol);

  return (
    <div className="app-shell">
      <button className="theme-toggle-btn" onClick={toggleTema} title="Cambiar tema" aria-label="Cambiar tema visual">
        {tema === 'light' ? <Moon size={22} /> : <Sun size={22} />}
      </button>

      {vista === VISTAS.HOME && (
        <div className="home-hyper">
          <TiendaPublica onLoginClick={abrirLogin} onRegisterClick={abrirRegistro} />

          {showAuth && (
            <div className="auth-overlay" onClick={() => setShowAuth(false)}>
              <div className="auth-modal card-premium" onClick={(e) => e.stopPropagation()}>
                <button className="close-auth" type="button" onClick={() => setShowAuth(false)}><X size={18} /></button>
                <div className="auth-switch">
                  <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Iniciar sesion</button>
                  <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Registrarse</button>
                </div>

                {mensaje.texto && <div className={`feedback ${mensaje.tipo === 'success' ? 'ok' : 'error'}`}>{mensaje.texto}</div>}

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="auth-form">
                    <div className="field-wrap"><label>Correo electronico</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div className="field-wrap"><label>Contrasena</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <button disabled={isLoading} type="submit" className="action-btn full">{isLoading ? 'Ingresando...' : 'Ingresar'}</button>
                  </form>
                ) : (
                  <form onSubmit={handleRegistroCliente} className="auth-form">
                    <div className="field-wrap"><label>Nombre completo</label><input type="text" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} required /></div>
                    <div className="field-wrap"><label>Telefono</label><input type="text" value={telefonoCliente} onChange={(e) => setTelefonoCliente(e.target.value)} required /></div>
                    <div className="field-wrap"><label>Correo electronico</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                    <div className="field-wrap"><label>Contrasena</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                    <button disabled={isLoading} type="submit" className="action-btn full">{isLoading ? 'Registrando...' : 'Crear cuenta'}</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {vista === VISTAS.OTP && (
        <div className="auth-wrapper">
          <div className="card-premium auth-card">
            <h2 className="auth-title">Verificacion de seguridad</h2>
            <p className="auth-subtitle">Ingresa el codigo de 6 digitos enviado a tu correo.</p>
            {mensaje.texto && <div className={`feedback ${mensaje.tipo === 'success' ? 'ok' : 'error'}`}>{mensaje.texto}</div>}
            <form onSubmit={handleVerificar}>
              <div className="field-wrap"><label>Codigo OTP</label><input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric" pattern="[0-9]{6}" /></div>
              <button disabled={isLoading} type="submit" className="action-btn full">{isLoading ? 'Verificando...' : 'Verificar codigo'}</button>
            </form>
            <button type="button" onClick={() => setVista(VISTAS.HOME)} className="action-btn outline full">Volver al inicio</button>
          </div>
        </div>
      )}

      {vista === VISTAS.DASHBOARD && (
        <div className="dashboard-container">
          <div className="header-principal">
            <div>
              <h1 style={{ margin: 0 }}>{dashboardConfig.titulo}</h1>
              <p style={{ color: 'var(--text-dim)', margin: '5px 0' }}>{dashboardConfig.subtitulo}</p>
            </div>
            <button onClick={cerrarSesion} style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cerrar sesion</button>
          </div>
          <div className="grid-metricas">
            <div className="card-premium"><div className="metrica-header"><div className="metrica-icono">{dashboardConfig.icono}</div><h3 style={{ color: 'var(--text-dim)', margin: 0, fontSize: '1rem' }}>Usuario activo</h3></div><p className="metrica-valor">{usuarioActivo?.nombre || 'N/A'}</p></div>
            <div className="card-premium"><div className="metrica-header"><div className="metrica-icono danger"><AlertTriangle size={24} /></div><h3 style={{ color: 'var(--text-dim)', margin: 0, fontSize: '1rem' }}>Rol</h3></div><p className="metrica-valor" style={{ color: 'var(--danger)' }}>{usuarioActivo?.rol || 'Sin rol'}</p></div>
            <div className="card-premium"><div className="metrica-header"><div className="metrica-icono"><DollarSign size={24} /></div><h3 style={{ color: 'var(--text-dim)', margin: 0, fontSize: '1rem' }}>{dashboardConfig.metricas[0].etiqueta}</h3></div><p className="metrica-valor">{dashboardConfig.metricas[0].valor}</p></div>
            <div className="card-premium"><div className="metrica-header"><div className="metrica-icono"><BarChart3 size={24} /></div><h3 style={{ color: 'var(--text-dim)', margin: 0, fontSize: '1rem' }}>{dashboardConfig.metricas[1].etiqueta}</h3></div><p className="metrica-valor">{dashboardConfig.metricas[1].valor}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
