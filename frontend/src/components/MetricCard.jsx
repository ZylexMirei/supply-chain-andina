export default function MetricCard({ icon, title, value, tone = 'default' }) {
  return (
    <div className="card-premium">
      <div className="metrica-header">
        <div className={`metrica-icono${tone === 'danger' ? ' danger' : ''}`}>{icon}</div>
        <h3 style={{ color: 'var(--text-dim)', margin: 0, fontSize: '1rem' }}>{title}</h3>
      </div>
      <p className={`metrica-valor${tone === 'danger' ? ' danger-text' : ''}`}>{value}</p>
    </div>
  );
}
