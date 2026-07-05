export default function StatCard({ icon: Icon, label, value, iconBackground, iconColor }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px' }}>
      <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: iconBackground, color: iconColor }}>
        <Icon size={24} />
      </div>
      <div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600' }}>{label}</span>
        <h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginTop: '4px' }}>{value}</h3>
      </div>
    </div>
  );
}