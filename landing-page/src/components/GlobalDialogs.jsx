import { createPortal } from 'react-dom';

export default function GlobalDialogs({ alertState, confirmState, onCloseAlert, onCloseConfirm }) {
  return (
    <>
      {alertState.show && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10005, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '24px', backgroundColor: '#121212', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              {alertState.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '12px' }}>
              {alertState.type === 'error' ? 'Attenzione' : 'Messaggio'}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.4' }}>
              {alertState.message}
            </p>
            <button onClick={onCloseAlert} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              OK
            </button>
          </div>
        </div>,
        document.body
      )}

      {confirmState.show && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10005, padding: '16px'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '24px', backgroundColor: '#121212', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              ⚠️
            </div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '12px' }}>
              Conferma Richiesta
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.4' }}>
              {confirmState.message}
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={onCloseConfirm} className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>
                Annulla
              </button>
              <button 
                onClick={() => {
                  if (confirmState.onConfirm) confirmState.onConfirm();
                  onCloseConfirm();
                }} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '10px', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}