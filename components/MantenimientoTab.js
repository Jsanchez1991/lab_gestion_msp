import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MantenimientoTab() {
  const [equipos, setEquipos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [responsable, setResponsable] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function fetchAll() {
    setLoading(true);
    const [{ data: eq }, { data: reg }] = await Promise.all([
      supabase.from('equipos').select('*').eq('activo', true).order('nombre'),
      supabase.from('mantenimiento_equipos').select('*').eq('fecha_verificacion', fecha),
    ]);
    setEquipos(eq || []);
    setRegistros(reg || []);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, [fecha]);

  function getRegistro(equipoId) {
    return registros.find((r) => r.equipo_id === equipoId);
  }

  async function actualizar(equipoId, campos) {
    setSaving(true);
    setError(null);
    const existente = getRegistro(equipoId);
    const payload = {
      equipo_id: equipoId,
      fecha_verificacion: fecha,
      responsable_mantenimiento: responsable || existente?.responsable_mantenimiento || '',
      ...(existente || {}),
      ...campos,
    };
    delete payload.id;
    delete payload.created_at;

    let res;
    if (existente) {
      res = await supabase.from('mantenimiento_equipos').update(payload).eq('id', existente.id);
    } else {
      res = await supabase.from('mantenimiento_equipos').insert([payload]);
    }
    if (res.error) setError(res.error.message);
    await fetchAll();
    setSaving(false);
  }

  const completados = registros.filter((r) => r.mantenimiento_realizado).length;
  const operativos = registros.filter((r) => r.equipo_operativo).length;

  return (
    <section>
      <div className="section-head" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">Mantenimiento preventivo · RAE1</h2>
          <span className="section-sub">Registro diario de control de equipos</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="form-field" style={{ maxWidth: 140 }}>
            <label>Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div className="form-field" style={{ maxWidth: 220 }}>
            <label>Responsable por defecto</label>
            <input value={responsable} onChange={(e) => setResponsable(e.target.value)}
              placeholder="Ej: LCDA GIANELLE HERNANDEZ" />
          </div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-blue">
          <div className="stat-label">Equipos</div>
          <div className="stat-value">{equipos.length}</div>
        </div>
        <div className="stat-card stat-teal">
          <div className="stat-label">Operativos</div>
          <div className="stat-value">{operativos}</div>
        </div>
        <div className="stat-card stat-blue-light">
          <div className="stat-label">Mantenimiento hecho</div>
          <div className="stat-value">{completados}</div>
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value">{equipos.length - completados}</div>
        </div>
      </div>

      {loading ? (
        <div className="table-wrap"><div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>Cargando…</div></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>Código/Serie</th>
                <th style={{ textAlign: 'center' }}>Operativo</th>
                <th>Responsable</th>
                <th style={{ textAlign: 'center' }}>Mantenimiento</th>
                <th>Comentarios</th>
              </tr>
            </thead>
            <tbody>
              {equipos.map((eq) => {
                const r = getRegistro(eq.id);
                return (
                  <tr key={eq.id}>
                    <td className="cell-primary">{eq.nombre}</td>
                    <td className="mono">{eq.codigo_serie || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`toggle-btn ${r?.equipo_operativo !== false ? 'on' : 'off'}`}
                        onClick={() => actualizar(eq.id, { equipo_operativo: !(r?.equipo_operativo !== false) })}
                        disabled={saving}
                      >
                        {r?.equipo_operativo !== false ? 'SÍ' : 'NO'}
                      </button>
                    </td>
                    <td>
                      <input
                        className="inline-input"
                        defaultValue={r?.responsable_mantenimiento || responsable}
                        onBlur={(e) => {
                          if (e.target.value !== (r?.responsable_mantenimiento || '')) {
                            actualizar(eq.id, { responsable_mantenimiento: e.target.value });
                          }
                        }}
                        placeholder="Nombre del responsable"
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className={`toggle-btn ${r?.mantenimiento_realizado ? 'on' : 'off'}`}
                        onClick={() => actualizar(eq.id, { mantenimiento_realizado: !r?.mantenimiento_realizado })}
                        disabled={saving}
                      >
                        {r?.mantenimiento_realizado ? 'SÍ' : 'NO'}
                      </button>
                    </td>
                    <td>
                      <input
                        className="inline-input"
                        defaultValue={r?.comentarios || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (r?.comentarios || '')) {
                            actualizar(eq.id, { comentarios: e.target.value });
                          }
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
