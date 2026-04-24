import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function NuevoRegistroModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    codigo_muestra: '',
    paciente_nombre: '',
    estado: 'PRE1',
  });

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('registro_muestras')
        .insert([
          {
            codigo_muestra: formData.codigo_muestra,
            paciente_nombre: formData.paciente_nombre,
            estado: formData.estado,
          }
        ])
        .select();

      if (insertError) throw insertError;

      onSuccess();
      onClose();
      setFormData({ codigo_muestra: '', paciente_nombre: '', estado: 'PRE1' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Nuevo Registro de Muestra</h3>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner" style={{ marginBottom: 15 }}>{error}</div>}
          
          <div className="form-group">
            <label>Código de Muestra</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Ej: L-2024-001"
              value={formData.codigo_muestra}
              onChange={(e) => setFormData({ ...formData, codigo_muestra: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Nombre del Paciente</label>
            <input
              type="text"
              className="form-control"
              required
              placeholder="Nombre completo"
              value={formData.paciente_nombre}
              onChange={(e) => setFormData({ ...formData, paciente_nombre: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Estado Inicial</label>
            <select
              className="form-control"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            >
              <option value="PRE1">PRE-1 (Pre-analítica)</option>
              <option value="AE1">AE-1 (Analítica)</option>
              <option value="rechazada">Rechazada</option>
              <option value="critico">Crítico</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
