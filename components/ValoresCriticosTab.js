import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Modal from './Modal';
import ValorCriticoForm from './ValorCriticoForm';

export default function ValoresCriticosTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('valores_criticos')
      .select('*')
      .order('fecha_deteccion', { ascending: false });
    if (error) setError(error.message);
    else setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  function handleSuccess() {
    setShowForm(false);
    fetchItems();
  }

  return (
    <section>
      <div className="section-head" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 className="section-title">Valores críticos · RPosA2</h2>
          <span className="section-sub">Comunicación de resultados críticos</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          + Registrar valor crítico
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="table-wrap">
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
            Cargando…
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚠</div>
          <div>No hay valores críticos registrados.</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código</th>
                <th>Paciente</th>
                <th>Prueba</th>
                <th>Resultado</th>
                <th>T. Respuesta</th>
                <th>Medio</th>
                <th>Read-back</th>
              </tr>
            </thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td>{new Date(v.fecha_deteccion).toLocaleDateString('es-EC')}</td>
                  <td className="mono">{v.codigo_muestra}</td>
                  <td>
                    <div className="cell-primary">{v.paciente_nombre}</div>
                    {v.profesional_recibe && <div className="cell-sub">→ {v.profesional_recibe}</div>}
                  </td>
                  <td>{v.prueba_laboratorio}</td>
                  <td><strong style={{ color: 'var(--amber-800)' }}>{v.resultado_critico}</strong></td>
                  <td>
                    {v.tiempo_respuesta_min !== null ? (
                      <span className={`badge ${v.tiempo_respuesta_min <= 30 ? 'badge-pre1' : 'badge-amber'}`}>
                        {v.tiempo_respuesta_min} min
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{v.medio_comunicacion || '—'}</td>
                  <td>
                    {v.read_back === true && <span className="badge badge-pre1">Sí</span>}
                    {v.read_back === false && <span className="badge badge-rechazada">No</span>}
                    {v.read_back === null && '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title="Registrar valor crítico" size="lg">
        <ValorCriticoForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
      </Modal>
    </section>
  );
}
