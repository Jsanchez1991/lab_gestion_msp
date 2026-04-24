import { useState } from 'react';

/**
 * Select con opción para agregar un nuevo valor inline.
 * - value: string almacenado (nombre)
 * - onChange: recibe evento tipo select
 * - options: array de objetos
 * - labelKey: campo a mostrar (default "nombre")
 * - onAdd: async (nuevoNombre) => objetoCreado
 */
export default function SelectWithAdd({
  value,
  onChange,
  options = [],
  onAdd,
  placeholder = 'Seleccionar…',
  labelKey = 'nombre',
  disabled = false,
}) {
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function confirmar() {
    const v = newValue.trim();
    if (!v) return;
    setSaving(true);
    setError(null);
    try {
      const created = await onAdd(v);
      if (created) {
        onChange({ target: { value: created[labelKey] } });
      }
      setNewValue('');
      setAdding(false);
    } catch (e) {
      setError(e.message || 'Error al agregar');
    } finally {
      setSaving(false);
    }
  }

  if (adding) {
    return (
      <div className="select-with-add">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Escribe el nuevo valor…"
          autoFocus
          disabled={saving}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); confirmar(); }
            if (e.key === 'Escape') { setAdding(false); setNewValue(''); setError(null); }
          }}
        />
        <button type="button" className="btn btn-primary btn-sm"
          onClick={confirmar} disabled={saving || !newValue.trim()}>
          {saving ? '…' : '✓'}
        </button>
        <button type="button" className="btn btn-secondary btn-sm"
          onClick={() => { setAdding(false); setNewValue(''); setError(null); }}
          disabled={saving}>
          ✕
        </button>
        {error && <div style={{ fontSize: 11, color: 'var(--red-800)', width: '100%' }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="select-with-add">
      <select value={value || ''} onChange={onChange} disabled={disabled}>
        <option value="">— {placeholder} —</option>
        {options.map((o) => (
          <option key={o.id || o[labelKey]} value={o[labelKey]}>
            {o[labelKey]}{o.cargo ? ` · ${o.cargo}` : ''}
          </option>
        ))}
      </select>
      <button type="button" className="btn-add" onClick={() => setAdding(true)}
        title="Agregar nuevo" disabled={disabled}>+</button>
    </div>
  );
}
