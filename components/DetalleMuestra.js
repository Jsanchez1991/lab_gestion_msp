import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ESTADOS = {
  PRE1:      { label: 'PRE-1',      desc: 'Pre-análisis' },
  AE1:       { label: 'AE-1',       desc: 'Análisis' },
  critico:   { label: 'Crítico',    desc: 'Valor crítico' },
  rechazada: { label: 'Rechazada',  desc: 'Muestra rechazada' },
};

const ANALISIS = [
  { key: 'hematologia',         label: 'Hematología' },
  { key: 'quimica_sanguinea',   label: 'Química Sanguínea' },
  { key: 'sangre_oculta',       label: 'Sangre Oculta' },
  { key: 'helicobacter_pilory', label: 'Helicobacter Pilory' },
  { key: 'orina',               label: 'Orina' },
  { key: 'heces',               label: 'Heces' },
  { key: 'bk_tuberculosis',     label: 'BK' },
];

export default function DetalleMuestra({ muestra, onUpdated, onClose, onRechazar, onValorCritico }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [rechazoInfo, setRechazoInfo] = useState(null);

  useEffect(() => {
    if (muestra?.estado === 'rechazada') {
      supabase.from('muestras_rechazadas').select('*').eq('muestra_id', muestra.id).single()
        .then(({ data }) => setRechazoInfo(data));
    }
  }, [muestra?.id, muestra?.estado]);

  async function cambiarEstado(nuevoEstado) {
    setBusy(true);
    setError(null);
    const { error } = await supabase
      .from('registro_muestras')
      .update({ estado: nuevoEstado })
      .eq('id', muestra.id);
    setBusy(false);
    if (error) setError(error.message);
    else onUpdated?.();
  }

  const analisisActivos = ANALISIS.filter((a) => muestra[a.key]);

  return (
    <div className="detalle">
      {error && <div className="error-banner">{error}</div>}

      <div className="detalle-header">
        <div>
          <div className="detalle-codigo mono">{muestra.codigo_muestra}</div>
          <div className="detalle-paciente">{muestra.paciente_nombre}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: 4 }}>
            {muestra.paciente_cedula && `CI: ${muestra.paciente_cedula}`}
            {muestra.paciente_edad && ` · ${muestra.paciente_edad} años`}
            {muestra.paciente_contacto && ` · ${muestra.paciente_contacto}`}
          </div>
        </div>
        <span className={`badge-lg badge-${(muestra.estado || '').toLowerCase()}`}>
          {ESTADOS[muestra.estado]?.label || muestra.estado}
        </span>
      </div>

      <div>
        <div className="detalle-section-title">Análisis solicitados</div>
        {analisisActivos.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>Sin análisis asignados.</div>
        ) : (
          <div className="chips-row">
            {analisisActivos.map((a) => (
              <span key={a.key} className="chip-on">✓ {a.label}</span>
            ))}
          </div>
        )}
      </div>

      <dl className="detalle-grid">
        <div><dt>Procedencia</dt><dd>{muestra.procedencia || '—'}</dd></div>
        <div><dt>Personal recolector</dt><dd>{muestra.personal_recolector || '—'}</dd></div>
        <div>
          <dt>Recolección primaria</dt>
          <dd>
            {muestra.fecha_recoleccion ? new Date(muestra.fecha_recoleccion).toLocaleDateString('es-EC') : '—'}
            {muestra.hora_recoleccion && ` · ${muestra.hora_recoleccion.slice(0, 5)}`}
          </dd>
        </div>
        <div><dt>Responsable ingreso lab</dt><dd>{muestra.responsable_ingreso || '—'}</dd></div>
        <div>
          <dt>Ingreso al lab</dt>
          <dd>
            {muestra.fecha_ingreso ? new Date(muestra.fecha_ingreso).toLocaleDateString('es-EC') : '—'}
            {muestra.hora_ingreso && ` · ${muestra.hora_ingreso.slice(0, 5)}`}
          </dd>
        </div>
        <div><dt>Registrada</dt><dd>{new Date(muestra.created_at).toLocaleString('es-EC')}</dd></div>
        {muestra.observaciones && (
          <div className="full"><dt>Observaciones</dt><dd>{muestra.observaciones}</dd></div>
        )}
      </dl>

      {rechazoInfo && (
        <div className="detalle-rechazo">
          <div className="detalle-section-title" style={{ color: 'var(--red-800)' }}>Información del rechazo</div>
          <dl className="detalle-grid">
            <div><dt>Causa</dt><dd>{rechazoInfo.causa_rechazo}</dd></div>
            <div><dt>Tipo</dt><dd>{rechazoInfo.tipo_rechazo === 'codigo' ? 'Por código / causa' : 'Identificación inadecuada'}</dd></div>
            <div><dt>Fecha</dt><dd>{new Date(rechazoInfo.fecha_rechazo).toLocaleDateString('es-EC')}</dd></div>
            <div><dt>Rechazó</dt><dd>{rechazoInfo.personal_rechaza_lab || '—'}</dd></div>
            <div><dt>Recibió devolución</dt><dd>{rechazoInfo.personal_recibe_devuelta || '—'}</dd></div>
            <div><dt>Procedencia recibe</dt><dd>{rechazoInfo.procedencia_recibe || '—'}</dd></div>
            {rechazoInfo.comentario && (
              <div className="full"><dt>Comentario</dt><dd>{rechazoInfo.comentario}</dd></div>
            )}
          </dl>
        </div>
      )}

      <div className="detalle-actions">
        <div className="detalle-actions-label">Acciones</div>
        <div className="detalle-actions-row">
          {muestra.estado === 'PRE1' && (
            <>
              <button className="btn btn-estado-ae1" disabled={busy}
                onClick={() => cambiarEstado('AE1')}>→ Pasar a AE-1</button>
              <button className="btn btn-estado-rechazada" disabled={busy}
                onClick={onRechazar}>✕ Rechazar muestra</button>
            </>
          )}
          {muestra.estado === 'AE1' && (
            <>
              <button className="btn btn-estado-critico" disabled={busy}
                onClick={onValorCritico}>⚠ Registrar valor crítico</button>
              <button className="btn btn-estado-rechazada" disabled={busy}
                onClick={onRechazar}>✕ Rechazar muestra</button>
              <button className="btn btn-secondary" disabled={busy}
                onClick={() => cambiarEstado('PRE1')}>← Volver a PRE-1</button>
            </>
          )}
          {muestra.estado === 'critico' && (
            <button className="btn btn-estado-ae1" disabled={busy}
              onClick={() => cambiarEstado('AE1')}>← Volver a AE-1</button>
          )}
          {muestra.estado === 'rechazada' && (
            <button className="btn btn-estado-pre1" disabled={busy}
              onClick={() => cambiarEstado('PRE1')}>↻ Reabrir a PRE-1</button>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onClose} disabled={busy}>Cerrar</button>
      </div>
    </div>
  );
}
