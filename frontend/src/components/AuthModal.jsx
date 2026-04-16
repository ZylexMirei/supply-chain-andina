import { X } from 'lucide-react';

export default function AuthModal({
  mode,
  setMode,
  isLoading,
  mensaje,
  onClose,
  onLogin,
  onRegister,
  onRequestRecovery,
  onConfirmRecovery,
  fields,
  setFields,
}) {
  const set = (key) => (e) => setFields((prev) => ({ ...prev, [key]: e.target.value }));
  const isRecoverMode = mode === 'recover_request' || mode === 'recover_confirm';
  const dialogLabel = mode === 'register'
    ? 'Registro de cliente'
    : isRecoverMode
      ? 'Recuperación de contraseña'
      : 'Iniciar sesión';

  return (
    <div className="auth-overlay" onClick={onClose} role="presentation">
      <div className="auth-modal card-premium" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={dialogLabel}>
        <button className="close-auth" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="auth-switch" role="tablist" aria-label="Autenticación">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Iniciar sesión
          </button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Registrarse
          </button>
        </div>

        {mensaje?.texto && <div className={`feedback ${mensaje.tipo === 'success' ? 'ok' : 'error'}`} role="status">{mensaje.texto}</div>}

        {mode === 'login' ? (
          <form onSubmit={onLogin} className="auth-form">
            <div className="field-wrap">
              <label htmlFor="auth-email">Correo electrónico</label>
              <input id="auth-email" type="email" value={fields.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="field-wrap">
              <label htmlFor="auth-pass">Contraseña</label>
              <input id="auth-pass" type="password" value={fields.password} onChange={set('password')} required autoComplete="current-password" />
            </div>
            <button type="button" className="link-btn" onClick={() => setMode('recover_request')}>
              ¿Olvidaste tu contraseña?
            </button>
            <button disabled={isLoading} type="submit" className="action-btn full">
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        ) : mode === 'recover_request' ? (
          <form onSubmit={onRequestRecovery} className="auth-form">
            <div className="field-wrap">
              <label htmlFor="recover-email">Correo de tu cuenta</label>
              <input id="recover-email" type="email" value={fields.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <button disabled={isLoading} type="submit" className="action-btn full">
              {isLoading ? 'Enviando...' : 'Enviar código de recuperación'}
            </button>
            <button type="button" className="link-btn" onClick={() => setMode('login')}>
              Volver a iniciar sesión
            </button>
          </form>
        ) : mode === 'recover_confirm' ? (
          <form onSubmit={onConfirmRecovery} className="auth-form">
            <div className="field-wrap">
              <label htmlFor="recover-email-confirm">Correo</label>
              <input id="recover-email-confirm" type="email" value={fields.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="field-wrap">
              <label htmlFor="recover-code">Código de recuperación</label>
              <input id="recover-code" type="text" value={fields.recoveryCode} onChange={(e) => setFields((prev) => ({ ...prev, recoveryCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} required inputMode="numeric" pattern="[0-9]{6}" />
            </div>
            <div className="field-wrap">
              <label htmlFor="recover-pass">Nueva contraseña</label>
              <input id="recover-pass" type="password" value={fields.newPassword} onChange={set('newPassword')} required minLength={6} autoComplete="new-password" />
            </div>
            <button disabled={isLoading} type="submit" className="action-btn full">
              {isLoading ? 'Actualizando...' : 'Restablecer contraseña'}
            </button>
            <button type="button" className="link-btn" onClick={() => setMode('recover_request')}>
              Reenviar código
            </button>
          </form>
        ) : (
          <form onSubmit={onRegister} className="auth-form">
            <div className="field-wrap">
              <label htmlFor="auth-nombre">Nombre completo</label>
              <input id="auth-nombre" type="text" value={fields.nombreCliente} onChange={set('nombreCliente')} required autoComplete="name" />
            </div>
            <div className="field-wrap">
              <label htmlFor="auth-tel">Teléfono</label>
              <input id="auth-tel" type="tel" value={fields.telefonoCliente} onChange={set('telefonoCliente')} required autoComplete="tel" />
            </div>
            <div className="field-wrap">
              <label htmlFor="auth-email2">Correo electrónico</label>
              <input id="auth-email2" type="email" value={fields.email} onChange={set('email')} required autoComplete="email" />
            </div>
            <div className="field-wrap">
              <label htmlFor="auth-pass2">Contraseña</label>
              <input id="auth-pass2" type="password" value={fields.password} onChange={set('password')} required autoComplete="new-password" />
            </div>
            <button disabled={isLoading} type="submit" className="action-btn full">
              {isLoading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
