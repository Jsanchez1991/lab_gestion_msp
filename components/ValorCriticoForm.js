import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MEDIOS = [
  { v: 'telefono', l: 'Teléfono' },
  { v: 'radio', l: 'Radio' },
  { v: 'presencial', l: 'Presencial' },
  { v: 'whatsapp', l: 'WhatsApp' },
  { v: 'correo', l: 'Correo electrónico' },
  { v: 'otro', l: 'Otro' },
];

export default function ValorCriticoForm({ muestraPrecargada, onSuccess, onCancel }) {
  const hoy = new Date().toISOString().slice(0, 10);
  const ahora = new Date().toTimeString().slice(0, 5);
  const [muestras, setMuestras] = useState([]);
  const [form, setForm] = useState({
    muestra_id: muestraPrecargada?.id || '',
    fecha_procesamiento: hoy,
    paciente_nombre: muestraPrecargada?.paciente_nombre || '',
    codigo_muestra: muestraPrecargada?.codigo_muestra || '',
    prueba_laboratorio: '',
    resultado_critico: '',
    fecha_deteccion: hoy,
    hora_deteccion: ahora,
    fecha_notificacion: hoy,
    hora_notificacion: ahora,
    responsable_comunico: '',
    profesional_recibe: '',
    servicio_recibe: muestraPrecargada?.procedencia || '',
    medio_comunicacion: 'telefono',
    read_back: true,
    motivo_no_comunicacion: '',
    comentarios: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!muestraPrecargada) {
      supabase.from('registro_muestras').select('id,codigo_muestra,paciente_nombre,procedencia')
        .order('created_at', { ascending: false }).limit(50)
        .then(({ data }) => setMuestras(data || []));
    }
  }, [muestraPrecargada]);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function onMuestraChange(e) {
    const id = e.target.value;
    const m = muestras.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      muestra_id: id,
      paciente_nombre: m?.paciente_nombre || f.paciente_nombre,
      codigo_muestra: m?.codigo_muestra || f.codigo_muestra,
      servicio_recibe: m?.procedencia || f.servicio_recibe,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      muestra_id: form.muestra_id || null,
    };
    const { error } = await supabase.from('valores_criticos').insert([payload]);

    // También marcar la muestra como crítica si está ligada
    if (!error && form.muestra_id) {
      await supabase.from('registro_muestras')
        .update({ estado: 'critico' }).eq('id', form.muestra_id);
    }
    setSaving(false);
    if (error) setError(error.message);
    else onSuccess?.();
  }

  // tiempo de respuesta calculado en vivo
  const tiempoResp = (() => {
    try {
      const a = new Date(`${form.fecha_deteccion}T${form.hora_deteccion}`);
      const b = new Date(`${form.fecha_notificacion}T${form.hora_notificacion}`);
      const mins = Math.round((b - a) / 60000);
      return isNaN(mins) ? '—' : `${mins} min`;
    } catch { return '—'; }
  })();

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="error-banner">{error}</div>}

      {!muestraPrecargada && (
        <div className="form-field">
          <label>Muestra asociada (opcional)</label>
          <select value={form.muestra_id} onChange={onMuestraChange}>
            <option value="">— Sin vincular a muestra —</option>
            {muestras.map((m) => (
              <option key={m.id} value={m.id}>
                {m.codigo_muestra} · {m.paciente_nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      <fieldset className="form-section">
        <legend>Paciente y muestra</legend>
        <div className="form-row">
          <div className="form-field" style={{ flex: 2 }}>
            <label>Identificación del paciente *</label>
            <input value={form.paciente_nombre} onChange={set('paciente_nombre')} required />
          </div>
          <div className="form-field">
            <label>Código de muestra *</label>
            <input className="mono" value={form.codigo_muestra}
              onChange={set('codigo_muestra')} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Fecha de procesamiento *</label>
            <input type="date" value={form.fecha_procesamiento}
              onChange={set('fecha_procesamiento')} required />
          </div>
          <div className="form-field" style={{ flex: 2 }}>
            <label>Prueba del laboratorio *</label>
            <input value={form.prueba_laboratorio} onChange={set('prueba_laboratorio')}
              placeholder="Ej: Glucosa, Hemoglobina, Potasio" required />
          </div>
        </div>
        <div className="form-field">
          <label>Resultado crítico *</label>
          <input value={form.resultado_critico} onChange={set('resultado_critico')}
            placeholder='Ej: "420 mg/dL"' required />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>
          Detección y notificación
          <span className="legend-badge" style={{ background: 'var(--amber-600)' }}>
            Tiempo de respuesta: {tiempoResp}
          </span>
        </legend>
        <div className="form-row">
          <div className="form-field">
            <label>Fecha detección *</label>
            <input type="date" value={form.fecha_deteccion}
              onChange={set('fecha_deteccion')} required />
          </div>
          <div className="form-field">
            <label>Hora detección *</label>
            <input type="time" value={form.hora_deteccion}
              onChange={set('hora_deteccion')} required />
          </div>
          <div className="form-field">
            <label>Fecha notificación</label>
            <input type="date" value={form.fecha_notificacion}
              onChange={set('fecha_notificacion')} />
          </div>
          <div className="form-field">
            <label>Hora notificación</label>
            <input type="time" value={form.hora_notificacion}
              onChange={set('hora_notificacion')} />
          </div>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Comunicación</legend>
        <div className="form-row">
          <div className="form-field">
            <label>Responsable del laboratorio que comunicó</label>
            <input value={form.responsable_comunico} onChange={set('responsable_comunico')} />
          </div>
          <div className="form-field">
            <label>Profesional de salud que recibe</label>
            <input value={form.profesional_recibe} onChange={set('profesional_recibe')}
              placeholder="Ej: DR. CARLOS MENDEZ" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Servicio o Institución</label>
            <input value={form.servicio_recibe} onChange={set('servicio_recibe')} />
          </div>
          <div className="form-field">
            <label>Medio de comunicación</label>
            <select value={form.medio_comunicacion} onChange={set('medio_comunicacion')}>
              {MEDIOS.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ maxWidth: 200 }}>
            <label>Verificación Read-back</label>
            <label className="toggle">
              <input type="checkbox" checked={form.read_back} onChange={set('read_back')} />
              <span>{form.read_back ? 'Sí, confirmado' : 'No verificado'}</span>
            </label>
          </div>
        </div>
        <div className="form-field">
          <label>Motivo por el cual NO se pudo comunicar (si aplica)</label>
          <input value={form.motivo_no_comunicacion} onChange={set('motivo_no_comunicacion')} />
        </div>
        <div className="form-field">
          <label>Comentarios</label>
          <textarea rows={2} value={form.comentarios} onChange={set('comentarios')} />
        </div>
      </fieldset>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Registrar valor crítico'}
        </button>
      </div>
    </form>
  );
}
