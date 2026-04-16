import { useState, useContext } from 'react';
import { Sun, Moon, ShieldCheck, UserRound, Warehouse, BarChart3 } from 'lucide-react';
import { ThemeContext } from './context/theme-context';
import TiendaPublica from './TiendaPublica';
import AuthModal from './components/AuthModal.jsx';
import Dashboard from './components/Dashboard.jsx';
import './App.css';
import { postJson, getApiBase } from './lib/api.js';

const API_BASE = getApiBase();
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
  const [codigo, setCodigo] = useState('');
  const [vista, setVista] = useState(VISTAS.HOME);
  const [authMode, setAuthMode] = useState('login');
  const [showAuth, setShowAuth] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authFields, setAuthFields] = useState({
    email: '',
    password: '',
    nombreCliente: '',
    telefonoCliente: '',
    recoveryCode: '',
    newPassword: '',
  });

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
      const data = await postJson('/login.php', { email: authFields.email, password: authFields.password });
      if (data.status === 'success') {
        setUsuarioActivo(data.user || null);
        setVista(VISTAS.DASHBOARD);
        setShowAuth(false);
      } else if (data.status === 'pending_verification') {
        setMensaje({ tipo: 'success', texto: data.message || 'Revisa tu correo y completa la verificación.' });
        setVista(VISTAS.OTP);
        setShowAuth(false);
      } else setMensaje({ tipo: 'error', texto: data.message || 'No se pudo iniciar sesión.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err?.message || 'Error de conexión.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistroCliente = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    setIsLoading(true);
    try {
      const data = await postJson(CLIENT_REGISTER_ENDPOINT, {
        nombre: authFields.nombreCliente,
        telefono: authFields.telefonoCliente,
        email: authFields.email,
        password: authFields.password,
      });

      setMensaje({ tipo: 'success', texto: data?.message || 'Registro exitoso. Ahora inicia sesión.' });
      setAuthFields((prev) => ({ ...prev, nombreCliente: '', telefonoCliente: '', password: '' }));
      setAuthMode('login');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err?.message || 'No se pudo registrar.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    setIsLoading(true);
    try {
      const data = await postJson('/verificar_codigo.php', { email: authFields.email, codigo });
      if (data.status === 'success') {
        setUsuarioActivo(data.user || null);
        setVista(VISTAS.DASHBOARD);
      } else setMensaje({ tipo: 'error', texto: data.message || 'Código inválido.' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err?.message || 'Error de conexión al verificar código.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolicitarRecuperacion = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!authFields.email) {
      setMensaje({ tipo: 'error', texto: 'Ingresa tu correo para recuperar la contraseña.' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await postJson('/recuperar_password.php', { email: authFields.email });
      setMensaje({ tipo: 'success', texto: data?.message || 'Código enviado. Revisa tu correo.' });
      setAuthMode('recover_confirm');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err?.message || 'No se pudo enviar el código de recuperación.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmarRecuperacion = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });
    setIsLoading(true);
    try {
      const data = await postJson('/reset_password.php', {
        email: authFields.email,
        codigo: authFields.recoveryCode,
        newPassword: authFields.newPassword,
      });

      setMensaje({ tipo: 'success', texto: data?.message || 'Contraseña actualizada. Ahora inicia sesión.' });
      setAuthFields((prev) => ({ ...prev, password: '', recoveryCode: '', newPassword: '' }));
      setAuthMode('login');
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err?.message || 'No se pudo actualizar la contraseña.' });
    } finally {
      setIsLoading(false);
    }
  };

  const cerrarSesion = () => {
    setUsuarioActivo(null);
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
            <AuthModal
              mode={authMode}
              setMode={setAuthMode}
              isLoading={isLoading}
              mensaje={mensaje}
              onClose={() => setShowAuth(false)}
              onLogin={handleLogin}
              onRegister={handleRegistroCliente}
              onRequestRecovery={handleSolicitarRecuperacion}
              onConfirmRecovery={handleConfirmarRecuperacion}
              fields={authFields}
              setFields={setAuthFields}
            />
          )}
        </div>
      )}

      {vista === VISTAS.OTP && (
        <div className="auth-wrapper">
          <div className="card-premium auth-card">
            <h2 className="auth-title">Verificacion de seguridad</h2>
            <p className="auth-subtitle">Ingresa el código de 6 dígitos enviado a tu correo.</p>
            {mensaje.texto && <div className={`feedback ${mensaje.tipo === 'success' ? 'ok' : 'error'}`}>{mensaje.texto}</div>}
            <form onSubmit={handleVerificar}>
              <div className="field-wrap">
                <label htmlFor="otp-code">Código OTP</label>
                <input id="otp-code" type="text" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric" pattern="[0-9]{6}" />
              </div>
              <button disabled={isLoading} type="submit" className="action-btn full">{isLoading ? 'Verificando...' : 'Verificar código'}</button>
            </form>
            <button type="button" onClick={() => setVista(VISTAS.HOME)} className="action-btn outline full">Volver al inicio</button>
          </div>
        </div>
      )}

      {vista === VISTAS.DASHBOARD && (
        <Dashboard dashboardConfig={dashboardConfig} usuarioActivo={usuarioActivo} onLogout={cerrarSesion} />
      )}
    </div>
  );
}

export default App;
