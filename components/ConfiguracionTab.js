import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { usePersonal, useProcedencias } from '../lib/catalogs';

const SUBTABS = [
  { id: 'establecimiento', label: 'Establecimiento' },
  { id: 'personal',        label: 'Personal' },
  { id: 'procedencias',    label: 'Procedencias' },
];

const CARGOS = [
  'Químico Farmacéutico',
  'Licenciado/a',
  'Auxiliar',
  'Médico',
  'Bioquímico/a',
  'Técnico/a',
  'Otro',
];

const TIPOS_PROCEDENCIA = [
  { v: 'servicio',    l: 'Servicio externo' },
  { v: 'institucion', l: 'Institución' },
  { v: 'interno',     l: 'Área interna' },
];

export default function ConfiguracionTab() {
  const [sub, setSub] = useState('establecimiento');

  return (
    <section>
      <div className="section-head">
        <h2 className="section-title">Configuración</h2>
        <span className="section-sub">Datos del establecimiento, personal y procedencias</span>
      </div>

      <div className="subtabs">
        {SUBTABS.map((s) => (
          <button key={s.id}
            className={`subtab ${sub === s.id ? 'active' : ''}`}
            onClick={() => setSub(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {sub === 'establecimiento' && <EstablecimientoForm />}
      {sub === 'personal' && <PersonalManager />}
      {sub === 'procedencias' && <ProcedenciasManager />}
    </section>
  );
}

/* ============================================================ */
function EstablecimientoForm() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    supabase.from('configuracion_establecimiento').select('*').limit(1).single()
      .then(({ data }) => setConfig(data));
  }, []);

  const set = (k) => (e) => setConfig((c) => ({ ...c, [k]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from('configuracion_establecimiento')
      .update({
        zona: config.zona,
        provincia: config.provincia,
        establecimiento: config.establecimiento,
        servicio: config.servicio,
        elaborado_por: config.elaborado_por,
        aprobado_por: config.aprobado_por,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', config.id);
    setSaving(false);
    setMsg(error ? { type: 'error', txt: error.message } : { type: 'ok', txt: 'Guardado correctamente' });
  }

  if (!config) {
    return <div className="table-wrap"><div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Cargando…</div></div>;
  }

  return (
    <form onSubmit={guardar} className="form config-card">
      {msg && (
        <div className={msg.type === 'ok' ? 'alert alert-success' : 'error-banner'}>
          {msg.txt}
        </div>
      )}
      <div className="form-row">
        <div className="form-field">
          <label>Zona</label>
          <input value={config.zona || ''} onChange={set('zona')} />
        </div>
        <div className="form-field">
          <label>Provincia</label>
          <input value={config.provincia || ''} onChange={set('provincia')} />
        </div>
        <div className="form-field">
          <label>Servicio</label>
          <input value={config.servicio || ''} onChange={set('servicio')} />
        </div>
      </div>
      <div className="form-field">
        <label>Establecimiento</label>
        <input value={config.establecimiento || ''} onChange={set('establecimiento')} />
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>Elaborado por</label>
          <input value={config.elaborado_por || ''} onChange={set('elaborado_por')} />
        </div>
        <div className="form-field">
          <label>Aprobado por</label>
          <input value={config.aprobado_por || ''} onChange={set('aprobado_por')} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

/* ============================================================ */
function PersonalManager() {
  const { personal, reload } = usePersonal();
  const [nuevo, setNuevo] = useState({ nombre: '', cargo: CARGOS[0] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function agregar(e) {
    e.preventDefault();
    if (!nuevo.nombre.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('personal').insert({
      nombre: nuevo.nombre.trim(),
      cargo: nuevo.cargo,
    });
    setSaving(false);
    if (error) setError(error.message);
    else {
      setNuevo({ nombre: '', cargo: CARGOS[0] });
      reload();
    }
  }

  async function desactivar(id) {
    if (!confirm('¿Desactivar este registro de personal?')) return;
    await supabase.from('personal').update({ activo: false }).eq('id', id);
    reload();
  }

  return (
    <div>
      <form onSubmit={agregar} className="config-card form-row-inline">
        <div className="form-field" style={{ flex: 2 }}>
          <label>Nombre del personal</label>
          <input value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            placeholder="Ej: DR. JUAN PEREZ" required />
        </div>
        <div className="form-field">
          <label>Cargo</label>
          <select value={nuevo.cargo} onChange={(e) => setNuevo({ ...nuevo, cargo: e.target.value })}>
            {CARGOS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          + Agregar
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Cargo</th><th style={{ width: 100 }}></th></tr>
          </thead>
          <tbody>
            {personal.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 30 }}>
                No hay personal registrado.
              </td></tr>
            )}
            {personal.map((p) => (
              <tr key={p.id}>
                <td className="cell-primary">{p.nombre}</td>
                <td>{p.cargo || '—'}</td>
                <td>
                  <button className="btn btn-link" onClick={() => desactivar(p.id)}
                    style={{ color: 'var(--red-600)' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================ */
function ProcedenciasManager() {
  const { procedencias, reload } = useProcedencias();
  const [nuevo, setNuevo] = useState({ nombre: '', tipo: 'servicio' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function agregar(e) {
    e.preventDefault();
    if (!nuevo.nombre.trim()) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('servicios_procedencia').insert({
      nombre: nuevo.nombre.trim(),
      tipo: nuevo.tipo,
    });
    setSaving(false);
    if (error) setError(error.message);
    else {
      setNuevo({ nombre: '', tipo: 'servicio' });
      reload();
    }
  }

  async function desactivar(id) {
    if (!confirm('¿Desactivar esta procedencia?')) return;
    await supabase.from('servicios_procedencia').update({ activo: false }).eq('id', id);
    reload();
  }

  return (
    <div>
      <form onSubmit={agregar} className="config-card form-row-inline">
        <div className="form-field" style={{ flex: 2 }}>
          <label>Nombre del servicio / institución</label>
          <input value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            placeholder="Ej: CENTRO DE SALUD 7" required />
        </div>
        <div className="form-field">
          <label>Tipo</label>
          <select value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}>
            {TIPOS_PROCEDENCIA.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          + Agregar
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Tipo</th><th style={{ width: 100 }}></th></tr>
          </thead>
          <tbody>
            {procedencias.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 30 }}>
                No hay procedencias registradas.
              </td></tr>
            )}
            {procedencias.map((p) => (
              <tr key={p.id}>
                <td className="cell-primary">{p.nombre}</td>
                <td>
                  <span className="badge badge-ae1">
                    {TIPOS_PROCEDENCIA.find((t) => t.v === p.tipo)?.l || p.tipo}
                  </span>
                </td>
                <td>
                  <button className="btn btn-link" onClick={() => desactivar(p.id)}
                    style={{ color: 'var(--red-600)' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
