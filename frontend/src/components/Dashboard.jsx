import { AlertTriangle, BarChart3, DollarSign } from 'lucide-react';
import MetricCard from './MetricCard.jsx';

export default function Dashboard({ dashboardConfig, usuarioActivo, onLogout }) {
  return (
    <div className="dashboard-container">
      <div className="header-principal">
        <div>
          <h1 style={{ margin: 0 }}>{dashboardConfig.titulo}</h1>
          <p style={{ color: 'var(--text-dim)', margin: '5px 0' }}>{dashboardConfig.subtitulo}</p>
        </div>
        <button onClick={onLogout} className="danger-btn" type="button">
          Cerrar sesión
        </button>
      </div>

      <div className="grid-metricas">
        <MetricCard icon={dashboardConfig.icono} title="Usuario activo" value={usuarioActivo?.nombre || 'N/A'} />
        <MetricCard icon={<AlertTriangle size={24} />} title="Rol" value={usuarioActivo?.rol || 'Sin rol'} tone="danger" />
        <MetricCard icon={<DollarSign size={24} />} title={dashboardConfig.metricas[0].etiqueta} value={dashboardConfig.metricas[0].valor} />
        <MetricCard icon={<BarChart3 size={24} />} title={dashboardConfig.metricas[1].etiqueta} value={dashboardConfig.metricas[1].valor} />
      </div>
    </div>
  );
}
