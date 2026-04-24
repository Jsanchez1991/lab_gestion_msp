import { useState } from 'react';
import { supabase } from '../lib/supabase';

const CAUSAS_COMUNES = [
  'Muestra hemolizada',
  'Muestra coagulada',
  'Volumen insuficiente',
  'Tubo incorrecto',
  'Muestra mal conservada',
  'Muestra contaminada',
  'Identificación inadecuada',
  'Otra',
];

export default function RechazoForm({ muestra, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    fecha_rechazo: new Date().toISOString().slice(0, 10),
    causa_rechazo: CAUSAS_COMUNES[0],
    causa_otra: '',
    tipo_rechazo: 'codigo',
    personal_rechaza_lab: '',
    personal_recibe_devuelta: '',
    procedencia_recibe: muestra?.procedencia || '',
    firma_recibe: '',
    comentario: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const causa = form.causa_rechazo === 'Otra' ? form.causa_otra : form.causa_rechazo;

    // 1. Cambiar estado de la muestra a 'rechazada'
    const { error: e1 } = await supabase
      .from('registro_muestras')
      .update({ estado: 'rechazada' })
      .eq('id', muestra.id);
    if (e1) { setSaving(false); setError(e1.message); return; }

    // 2. Insertar detalle del rechazo
    const { error: e2 } = await supabase.from('muestras_rechazadas').insert([{
      muestra_id: muestra.id,
      fecha_rechazo: form.fecha_rechazo,
      causa_rechazo: causa,
      tipo_rechazo: form.tipo_rechazo,
      personal_rechaza_lab: form.personal_rechaza_lab,
      personal_recibe_devuelta: form.personal_recibe_devuelta,
      procedencia_recibe: form.procedencia_recibe,
      firma_recibe: form.firma_recibe,
      comentario: form.comentario,
    }]);
    setSaving(false);
    if (e2) setError(e2.message);
    else onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="error-banner">{error}</div>}

      <div className="alert alert-warning">
        Vas a rechazar la muestra <strong className="mono">{muestra?.codigo_muestra}</strong> de{' '}
        <strong>{muestra?.paciente_nombre}</strong>.
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Fecha de rechazo *</label>
          <input type="date" value={form.fecha_rechazo}
            onChange={set('fecha_rechazo')} required />
        </div>
        <div className="form-field">
          <label>Tipo de rechazo *</label>
          <select value={form.tipo_rechazo} onChange={set('tipo_rechazo')}>
            <option value="codigo">Por código / causa general</option>
            <option value="identificacion_inadecuada">Por identificación inadecuada</option>
          </select>
        </div>
      </div>

      <div className="form-field">
        <label>Causa de rechazo *</label>
        <select value={form.causa_rechazo} onChange={set('causa_rechazo')}>
          {CAUSAS_COMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {form.causa_rechazo === 'Otra' && (
        <div className="form-field">
          <label>Especifique la causa *</label>
          <input value={form.causa_otra} onChange={set('causa_otra')} required />
        </div>
      )}

      <div className="form-row">
        <div className="form-field">
          <label>Personal que rechaza (desde el laboratorio)</label>
          <input value={form.personal_rechaza_lab} onChange={set('personal_rechaza_lab')}
            placeholder="Ej: QF JESSENIA NAVARRO" />
        </div>
        <div className="form-field">
          <label>Personal que recibe la muestra rechazada</label>
          <input value={form.personal_recibe_devuelta} onChange={set('personal_recibe_devuelta')}
            placeholder="Ej: AUX BETSY HERRERA" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>Procedencia del que recibe</label>
          <input value={form.procedencia_recibe} onChange={set('procedencia_recibe')} />
        </div>
        <div className="form-field">
          <label>Firma (nombre del responsable que recibe)</label>
          <input value={form.firma_recibe} onChange={set('firma_recibe')} />
        </div>
      </div>

      <div className="form-field">
        <label>Comentario</label>
        <textarea rows={2} value={form.comentario} onChange={set('comentario')} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-danger" disabled={saving}>
          {saving ? 'Rechazando…' : 'Confirmar rechazo'}
        </button>
      </div>
    </form>
  );
}
