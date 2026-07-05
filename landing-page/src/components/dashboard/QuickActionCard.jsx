import { ArrowRight } from 'lucide-react';

export default function QuickActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="card card-hover" 
      style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-hover)' }}>
          <Icon size={22} />
        </span>
        <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>{title}</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.4' }}>
        {description}
      </p>
    </div>
  );
}