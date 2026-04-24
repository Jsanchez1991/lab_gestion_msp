const ESTADO_LABELS = {
  PRE1: 'PRE-1',
  AE1: 'AE-1',
  critico: 'Crítico',
  rechazada: 'Rechazada',
};

const ANALISIS_SHORT = [
  { k: 'hematologia',         s: 'Hem' },
  { k: 'quimica_sanguinea',   s: 'QS' },
  { k: 'sangre_oculta',       s: 'SO' },
  { k: 'helicobacter_pilory', s: 'HP' },
  { k: 'orina',               s: 'O' },
  { k: 'heces',               s: 'H' },
  { k: 'bk_tuberculosis',     s: 'BK' },
];

function AnalisisChips({ muestra }) {
  const activos = ANALISIS_SHORT.filter((a) => muestra[a.k]);
  if (activos.length === 0) return <span style={{ color: 'var(--gray-400)' }}>—</span>;
  return (
    <div className="chips-mini">
      {activos.map((a) => <span key={a.k} className="chip-mini">{a.s}</span>)}
    </div>
  );
}

export default function MuestrasTable({ muestras, loading, emptyMsg, onView }) {
  if (loading) {
    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Fecha</th><th>Código</th><th>Paciente</th><th>Procedencia</th><th>Análisis</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map((i) => (
              <tr key={i}>
                <td><span className="skeleton" style={{ width: 80 }} /></td>
                <td><span className="skeleton" style={{ width: 100 }} /></td>
                <td><span className="skeleton" style={{ width: 160 }} /></td>
                <td><span className="skeleton" style={{ width: 100 }} /></td>
                <td><span className="skeleton" style={{ width: 90 }} /></td>
                <td><span className="skeleton" style={{ width: 70 }} /></td>
                <td><span className="skeleton" style={{ width: 40 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!muestras.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">◯</div>
        <div>{emptyMsg || 'No hay muestras registradas.'}</div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Código</th>
            <th>Paciente</th>
            <th>Procedencia</th>
            <th>Análisis</th>
            <th>Estado</th>
            <th style={{ width: 80 }}></th>
          </tr>
        </thead>
        <tbody>
          {muestras.map((m) => (
            <tr key={m.id} className="row-hover" onClick={() => onView?.(m)}>
              <td>
                {m.fecha_ingreso
                  ? new Date(m.fecha_ingreso).toLocaleDateString('es-EC')
                  : new Date(m.created_at).toLocaleDateString('es-EC')}
                {m.hora_ingreso && <div className="cell-sub">{m.hora_ingreso.slice(0, 5)}</div>}
              </td>
              <td className="mono">{m.codigo_muestra}</td>
              <td>
                <div className="cell-primary">{m.paciente_nombre}</div>
                {m.paciente_cedula && <div className="cell-sub">{m.paciente_cedula}
                  {m.paciente_edad ? ` · ${m.paciente_edad} años` : ''}
                </div>}
              </td>
              <td>{m.procedencia || '—'}</td>
              <td><AnalisisChips muestra={m} /></td>
              <td>
                <span className={`badge badge-${(m.estado || '').toLowerCase()}`}>
                  {ESTADO_LABELS[m.estado] || m.estado || '—'}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-link"
                  onClick={(e) => { e.stopPropagation(); onView?.(m); }}
                >
                  Ver →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
