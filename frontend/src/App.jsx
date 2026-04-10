import { useState } from 'react'
import { Mail, Lock, KeyRound, Building2, LogIn } from 'lucide-react' 
import './App.css'
import TiendaPublica from './TiendaPublica';

function App() {
  // Estados para guardar lo que escribe el usuario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [codigo, setCodigo] = useState('')
  
  // Estados para controlar la pantalla y mensajes
  const [paso, setPaso] = useState('LOGIN') // Puede ser 'LOGIN', 'OTP', 'DASHBOARD' o 'TIENDA'
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' })
  const [usuarioActivo, setUsuarioActivo] = useState(null)

  // Función 1: Enviar correo y contraseña a PHP
  const handleLogin = async (e) => {
    e.preventDefault()
    setMensaje({ tipo: '', texto: '' })

    try {
      const response = await fetch('http://localhost:8000/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()

      if (data.status === 'success') {
        setUsuarioActivo(data.user)
        setPaso('DASHBOARD')
      } else if (data.status === 'pending_verification') {
        setMensaje({ tipo: 'success', texto: data.message })
        setPaso('OTP')
      } else {
        setMensaje({ tipo: 'error', texto: data.message })
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al conectar con el servidor PHP' })
    }
  }

  // Función 2: Enviar el código de 6 dígitos a PHP
  const handleVerificar = async (e) => {
    e.preventDefault()
    setMensaje({ tipo: '', texto: '' })

    try {
      const response = await fetch('http://localhost:8000/api/verificar_codigo.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo })
      })
      
      const data = await response.json()

      if (data.status === 'success') {
        setUsuarioActivo(data.user)
        setPaso('DASHBOARD')
      } else {
        setMensaje({ tipo: 'error', texto: data.message })
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al verificar el código' })
    }
  }

  // --- RENDERIZADO DE PANTALLAS ---

  // 👉 NUEVA PANTALLA: La Tienda Pública con Inteligencia Artificial
  if (paso === 'TIENDA') {
    return (
      <div>
        <button 
          onClick={() => setPaso('LOGIN')} 
          style={{ margin: '20px', padding: '10px', background: 'var(--borde)', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ⬅️ Volver al Login
        </button>
        <TiendaPublica /> 
      </div>
    )
  }

  // PANTALLA 3: Si ya entró con éxito (Dashboard del Empleado)
  if (paso === 'DASHBOARD') {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>¡Bienvenida, {usuarioActivo.nombre}! 🎉</h2>
          <p>Tu rol en el sistema es: <b>{usuarioActivo.rol}</b></p>
          <button className="btn-primary" onClick={() => setPaso('LOGIN')}>Cerrar Sesión</button>
        </div>
      </div>
    )
  }

  // PANTALLA 2: Si necesita verificar el código OTP
  if (paso === 'OTP') {
    return (
      <div className="login-container">
        <div className="login-box">
          <h2>Verificación de Seguridad 🛡️</h2>
          {mensaje.texto && <div className={`alert-${mensaje.tipo}`}>{mensaje.texto}</div>}
          <form onSubmit={handleVerificar}>
            <div className="input-group">
              <label>Ingresa el código de 6 dígitos enviado a tu correo:</label>
              <input 
                type="text" 
                maxLength="6"
                value={codigo} 
                onChange={(e) => setCodigo(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary">Verificar Código</button>
          </form>
        </div>
      </div>
    )
  }

  // PANTALLA 1: Login normal
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Distribuidora Andina S.R.L. 🏢</h2>
        {mensaje.texto && <div className={`alert-${mensaje.tipo}`}>{mensaje.texto}</div>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Correo Electrónico:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary">Iniciar Sesión</button>
        </form>

        {/* 👉 BOTÓN NUEVO PARA ENTRAR DIRECTO A LA TIENDA SIN LOGUEARSE */}
        <hr style={{ margin: '20px 0', borderColor: 'var(--borde)' }} />
        <button 
          type="button" 
          onClick={() => setPaso('TIENDA')} 
          style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--color-primario)', color: 'var(--color-primario)', borderRadius: '5px', cursor: 'pointer' }}
        >
          🛒 Ver Tienda Pública
        </button>

      </div>
    </div>
  )
}

export default App