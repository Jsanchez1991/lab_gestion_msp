import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { usePersonal, useProcedencias } from '../lib/catalogs';
import SelectWithAdd from './SelectWithAdd';

const ANALISIS = [
  { key: 'hematologia',          label: 'Hematología',        short: 'Hem' },
  { key: 'quimica_sanguinea',    label: 'Química Sanguínea',  short: 'QS' },
  { key: 'sangre_oculta',        label: 'Sangre Oculta',      short: 'SO' },
  { key: 'helicobacter_pilory',  label: 'Helicobacter Pilory',short: 'HP' },
  { key: 'orina',                label: 'Orina',              short: 'O' },
  { key: 'heces',                label: 'Heces',              short: 'H' },
  { key: 'bk_tuberculosis',      label: 'BK (Tuberculosis)',  short: 'BK' },
];

function generarCodigo() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900 + 100);
  return `${mm}${dd}C7${rand}`;
}

function horaActual() {
  return new Date().toTimeString().slice(0, 5);
}

export default function NuevoRegistroForm({ onSuccess, onCancel }) {
  const { personal, add: addPersonal } = usePersonal();
  const { procedencias, add: addProcedencia } = useProcedencias();
  const hoy = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    // paciente
    paciente_nombre: '',
    paciente_cedula: '',
    paciente_edad: '',
    paciente_contacto: '',

    // muestra
    codigo_muestra: generarCodigo(),
    procedencia: '',

    // muestra primaria
    personal_recolector: '',
    fecha_recoleccion: hoy,
    hora_recoleccion: horaActual(),

    // ingreso al laboratorio
    responsable_ingreso: '',
    fecha_ingreso: hoy,
    hora_ingreso: horaActual(),

    // analisis
    hematologia: false,
    quimica_sanguinea: false,
    sangre_oculta: false,
    helicobacter_pilory: false,
    orina: false,
    heces: false,
    bk_tuberculosis: false,

    estado: 'PRE1',
    observaciones: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const total = ANALISIS.filter((a) => form[a.key]).length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (total === 0) {
      setError('Debe seleccionar al menos un tipo de análisis.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      paciente_edad: form.paciente_edad ? parseInt(form.paciente_edad, 10) : null,
    };
    const { error } = await supabase.from('registro_muestras').insert([payload]);
    setSaving(false);
    if (error) setError(error.message);
    else onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      {error && <div className="error-banner">{error}</div>}

      {/* ======= PACIENTE ======= */}
      <fieldset className="form-section">
        <legend>Identificación del paciente</legend>
        <div className="form-row">
          <div className="form-field" style={{ flex: 2 }}>
            <label>Nombre completo (2 nombres, 2 apellidos) *</label>
            <input value={form.paciente_nombre} onChange={set('paciente_nombre')}
              placeholder="Ej: CAMACHO CIRINO GENESIS ARLETH" required />
          </div>
          <div className="form-field">
            <label>Cédula</label>
            <input value={form.paciente_cedula} onChange={set('paciente_cedula')}
              maxLength={10} placeholder="0912345678" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ maxWidth: 120 }}>
            <label>Edad (años)</label>
            <input type="number" min="0" max="120" value={form.paciente_edad}
              onChange={set('paciente_edad')} />
          </div>
          <div className="form-field">
            <label>Contacto del paciente</label>
            <input value={form.paciente_contacto} onChange={set('paciente_contacto')}
              placeholder="Teléfono o NT" />
          </div>
        </div>
      </fieldset>

      {/* ======= MUESTRA PRIMARIA ======= */}
      <fieldset className="form-section">
        <legend>Muestra primaria (recolección)</legend>
        <div className="form-row">
          <div className="form-field">
            <label>Código único de muestra *</label>
            <input className="mono" value={form.codigo_muestra}
              onChange={set('codigo_muestra')} required />
          </div>
          <div className="form-field" style={{ flex: 2 }}>
            <label>Procedencia (Servicio o Institución)</label>
            <SelectWithAdd
              value={form.procedencia}
              onChange={set('procedencia')}
              options={procedencias}
              onAdd={addProcedencia}
              placeholder="Ej: CENTRO DE SALUD 7"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-field" style={{ flex: 2 }}>
            <label>Personal que recolectó la muestra primaria</label>
            <SelectWithAdd
              value={form.personal_recolector}
              onChange={set('personal_recolector')}
              options={personal}
              onAdd={addPersonal}
              placeholder="Ej: AUX BETSY HERRERA TRIANA"
            />
          </div>
          <div className="form-field">
            <label>Fecha de recolección</label>
            <input type="date" value={form.fecha_recoleccion}
              onChange={set('fecha_recoleccion')} />
          </div>
          <div className="form-field" style={{ maxWidth: 110 }}>
            <label>Hora</label>
            <input type="time" value={form.hora_recoleccion}
              onChange={set('hora_recoleccion')} />
          </div>
        </div>
      </fieldset>

      {/* ======= INGRESO AL LAB ======= */}
      <fieldset className="form-section">
        <legend>Ingreso al laboratorio</legend>
        <div className="form-row">
          <div className="form-field" style={{ flex: 2 }}>
            <label>Responsable de ingreso</label>
            <SelectWithAdd
              value={form.responsable_ingreso}
              onChange={set('responsable_ingreso')}
              options={personal}
              onAdd={addPersonal}
              placeholder="Ej: QF JESSENIA NAVARRO"
            />
          </div>
          <div className="form-field">
            <label>Fecha ingreso</label>
            <input type="date" value={form.fecha_ingreso} onChange={set('fecha_ingreso')} />
          </div>
          <div className="form-field" style={{ maxWidth: 110 }}>
            <label>Hora</label>
            <input type="time" value={form.hora_ingreso} onChange={set('hora_ingreso')} />
          </div>
        </div>
      </fieldset>

      {/* ======= ANÁLISIS ======= */}
      <fieldset className="form-section">
        <legend>
          Análisis solicitados
          <span className="legend-badge">{total}</span>
        </legend>
        <div className="checks-grid">
          {ANALISIS.map((a) => (
            <label key={a.key} className={`check-chip ${form[a.key] ? 'on' : ''}`}>
              <input type="checkbox" checked={form[a.key]} onChange={set(a.key)} />
              <span className="check-short">{a.short}</span>
              <span className="check-label">{a.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* ======= ESTADO + OBSERVACIONES ======= */}
      <div className="form-row">
        <div className="form-field" style={{ maxWidth: 220 }}>
          <label>Estado inicial</label>
          <select value={form.estado} onChange={set('estado')}>
            <option value="PRE1">PRE-1 (pre-análisis)</option>
            <option value="AE1">AE-1 (análisis)</option>
          </select>
        </div>
        <div className="form-field">
          <label>Observaciones / Comentarios</label>
          <textarea rows={2} value={form.observaciones} onChange={set('observaciones')} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando…' : `Registrar (${total} análisis)`}
        </button>
      </div>
    </form>
  );
}
