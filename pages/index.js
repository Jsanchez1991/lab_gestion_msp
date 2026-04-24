import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import MuestrasTable from '../components/MuestrasTable';
import Modal from '../components/Modal';
import ConfiguracionTab from '../components/ConfiguracionTab';
import NuevoRegistroForm from '../components/NuevoRegistroForm';
import DetalleMuestra from '../components/DetalleMuestra';
import RechazoForm from '../components/RechazoForm';
import ValorCriticoForm from '../components/ValorCriticoForm';
import ValoresCriticosTab from '../components/ValoresCriticosTab';
import MantenimientoTab from '../components/MantenimientoTab';

const TABS = [
  { id: 'dashboard',   label: 'Dashboard' },
  { id: 'pre1',        label: 'PRE-1' },
  { id: 'ae1',         label: 'AE-1' },
  { id: 'rechazadas',  label: 'Rechazadas' },
  { id: 'criticos',    label: 'Críticos' },
  { id: 'config',      label: '⚙️ Configuración' },
  { id: 'equipos',     label: 'Equipos' },
];

const STATS = [
  { label: 'Total',      estado: null,        color: 'blue',       hint: 'Todas las muestras' },
  { label: 'PRE-1',      estado: 'PRE1',      color: 'teal',       hint: 'En pre-análisis' },
  { label: 'AE-1',       estado: 'AE1',       color: 'blue-light', hint: 'En análisis' },
  { label: 'Rechazadas', estado: 'rechazada', color: 'red',        hint: 'Muestras rechazadas' },
  { label: 'Críticos',   estado: 'critico',   color: 'amber',      hint: 'Valores críticos' },
];

export default function Home({ session }) {
  const [muestras, setMuestras] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);

  const [showNuevo, setShowNuevo] = useState(false);
  const [detalle, setDetalle] = useState(null);
  const [showRechazo, setShowRechazo] = useState(false);
  const [showCritico, setShowCritico] = useState(false);

  useEffect(() => {
    fetchMuestras();
    supabase.from('configuracion_establecimiento').select('*').limit(1).single()
      .then(({ data }) => setConfig(data));
  }, []);

  async function fetchMuestras() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('registro_muestras').select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setMuestras(data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const byEstado = (estado) =>
    muestras.filter((m) => (m.estado || '').toLowerCase() === estado.toLowerCase());

  async function refreshDetalle() {
    await fetchMuestras();
    if (detalle) {
      const { data } = await supabase.from('registro_muestras').select('*').eq('id', detalle.id).single();
      if (data) setDetalle(data);
    }
  }

  function handleRechazoSuccess() {
    setShowRechazo(false);
    setDetalle(null);
    fetchMuestras();
  }

  function handleCriticoSuccess() {
    setShowCritico(false);
    setDetalle(null);
    fetchMuestras();
  }

  return (
    <div>
      <Head>
        <title>LabGestión MSP</title>
        <meta name="theme-color" content="#0F4C81" />
      </Head>

      <header className="app-header">
        <div className="header-brand">
          <div className="logo">MSP</div>
          <div>
            <h1>LabGestión</h1>
            <span className="header-sub">
              {config?.establecimiento || 'CSMI Martha de Roldós'}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <div className="user-info" style={{ 
            fontSize: '11px', textAlign: 'right', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', opacity: 0.8
          }}>
            <span>{session?.user?.email}</span>
            <button 
              onClick={() => supabase.auth.signOut()}
              style={{ background: 'none', border: 'none', color: '#5BC8F5', cursor: 'pointer', padding: 0, textAlign: 'right', fontSize: '10px' }}
            >
              Cerrar sesión
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNuevo(true)}>
            + Nuevo Registro
          </button>
          <button className="btn btn-ghost btn-sm" onClick={fetchMuestras} disabled={loading}>
            {loading ? '…' : '↺ Actualizar'}
          </button>
        </div>
      </header>

      <nav className="nav-tabs">
        {TABS.map(({ id, label }) => {
          let count = null;
          if (id === 'pre1') count = byEstado('PRE1').length;
          else if (id === 'ae1') count = byEstado('AE1').length;
          else if (id === 'rechazadas') count = byEstado('rechazada').length;
          else if (id === 'criticos') count = byEstado('critico').length;

          return (
            <div key={id}
              className={`nav-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}>
              {label}
              {count !== null && <span className="nav-count">{count}</span>}
            </div>
          );
        })}
      </nav>

      <main className="main">
        {error && (
          <div className="error-banner">
            <span>Error: {error}</span>
            <button className="btn btn-sm btn-secondary" onClick={fetchMuestras}>Reintentar</button>
          </div>
        )}

        {tab === 'dashboard' && (
          <section>
            {config && (
              <div className="institutional-banner">
                <div>
                  <div className="inst-title">Ministerio de Salud Pública del Ecuador</div>
                  <div className="inst-sub">{config.zona} · Provincia de {config.provincia}</div>
                </div>
                <div>
                  <div className="inst-label">Establecimiento</div>
                  <div className="inst-value">{config.establecimiento}</div>
                </div>
                <div>
                  <div className="inst-label">Elaborado por</div>
                  <div className="inst-value">{config.elaborado_por}</div>
                </div>
                <div>
                  <div className="inst-label">Aprobado por</div>
                  <div className="inst-value">{config.aprobado_por}</div>
                </div>
              </div>
            )}

            <div className="section-head">
              <h2 className="section-title">Resumen</h2>
              <span className="section-sub">Estado actual del laboratorio</span>
            </div>
            <div className="stats-grid">
              {STATS.map(({ label, estado, color, hint }) => (
                <div key={label} className={`stat-card stat-${color}`}>
                  <div className="stat-label">{label}</div>
                  <div className="stat-value">
                    {loading ? '—' : estado ? byEstado(estado).length : muestras.length}
                  </div>
                  <div className="stat-hint">{hint}</div>
                </div>
              ))}
            </div>

            <div className="section-head" style={{ marginTop: 32 }}>
              <h2 className="section-title">Últimas muestras</h2>
              <span className="section-sub">Registros recientes</span>
            </div>
            <MuestrasTable
              muestras={muestras.slice(0, 8)}
              loading={loading}
              emptyMsg="Aún no hay muestras registradas."
              onView={setDetalle}
            />
          </section>
        )}

        {tab === 'pre1' && (
          <MuestrasTable muestras={byEstado('PRE1')} loading={loading} onView={setDetalle}
            emptyMsg="No hay muestras en etapa PRE-1." />
        )}
        {tab === 'ae1' && (
          <MuestrasTable muestras={byEstado('AE1')} loading={loading} onView={setDetalle}
            emptyMsg="No hay muestras en etapa AE-1." />
        )}
        {tab === 'rechazadas' && (
          <MuestrasTable muestras={byEstado('rechazada')} loading={loading} onView={setDetalle}
            emptyMsg="No hay muestras rechazadas." />
        )}
        {tab === 'criticos' && <ValoresCriticosTab />}
        {tab === 'equipos' && <MantenimientoTab />}
        {tab === 'config' && <ConfiguracionTab />}
      </main>

      <Modal open={showNuevo} onClose={() => setShowNuevo(false)}
        title="Nueva muestra · RPre1" size="lg">
        <NuevoRegistroForm onSuccess={() => { setShowNuevo(false); fetchMuestras(); }}
          onCancel={() => setShowNuevo(false)} />
      </Modal>

      <Modal open={!!detalle && !showRechazo && !showCritico}
        onClose={() => setDetalle(null)} title="Detalle de la muestra" size="md">
        {detalle && (
          <DetalleMuestra
            muestra={detalle}
            onUpdated={refreshDetalle}
            onClose={() => setDetalle(null)}
            onRechazar={() => setShowRechazo(true)}
            onValorCritico={() => setShowCritico(true)}
          />
        )}
      </Modal>

      <Modal open={showRechazo} onClose={() => setShowRechazo(false)}
        title="Rechazar muestra · RPre2" size="md">
        {detalle && (
          <RechazoForm muestra={detalle}
            onSuccess={handleRechazoSuccess}
            onCancel={() => setShowRechazo(false)} />
        )}
      </Modal>

      <Modal open={showCritico} onClose={() => setShowCritico(false)}
        title="Registrar valor crítico · RPosA2" size="lg">
        {detalle && (
          <ValorCriticoForm muestraPrecargada={detalle}
            onSuccess={handleCriticoSuccess}
            onCancel={() => setShowCritico(false)} />
        )}
      </Modal>
    </div>
  );
}
