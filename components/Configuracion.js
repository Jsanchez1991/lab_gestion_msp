import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCatalogos } from '../lib/hooks/useCatalogos';

export default function Configuracion() {
  const { personal, servicios, loading, refresh } = useCatalogos();
  const [activeTab, setActiveTab] = useState('personal');
  const [newItem, setNewItem] = useState('');
  const [extra, setExtra] = useState(''); // Para cargo o tipo
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newItem.trim()) return;
    setSubmitting(true);

    try {
      if (activeTab === 'personal') {
        const { error } = await supabase
          .from('personal')
          .insert([{ nombre: newItem, cargo: extra }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('servicios_procedencia')
          .insert([{ nombre: newItem, tipo: extra || 'servicio' }]);
        if (error) throw error;
      }
      setNewItem('');
      setExtra('');
      refresh();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(id, table, currentStatus) {
    try {
      const { error } = await supabase
        .from(table)
        .update({ activo: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      refresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div className="config-container">
      <h2 className="section-title">Configuración de Catálogos</h2>
      
      <div className="config-tabs">
        <button 
          className={`config-tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal
        </button>
        <button 
          className={`config-tab ${activeTab === 'servicios' ? 'active' : ''}`}
          onClick={() => setActiveTab('servicios')}
        >
          Servicios / Procedencia
        </button>
      </div>

      <div className="config-content">
        <form className="add-item-form" onSubmit={handleAdd}>
          <input 
            type="text" 
            className="form-control" 
            placeholder={activeTab === 'personal' ? 'Nombre del personal' : 'Nombre del servicio'}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            required
          />
          <input 
            type="text" 
            className="form-control" 
            placeholder={activeTab === 'personal' ? 'Cargo' : 'Tipo (servicio, institucion, interno)'}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
          />
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Añadiendo...' : 'Añadir'}
          </button>
        </form>

        <div className="items-list">
          {loading ? (
            <p>Cargando...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>{activeTab === 'personal' ? 'Cargo' : 'Tipo'}</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(activeTab === 'personal' ? personal : servicios).map((item) => (
                  <tr key={item.id} style={{ opacity: item.activo ? 1 : 0.5 }}>
                    <td>{item.nombre}</td>
                    <td>{activeTab === 'personal' ? item.cargo : item.tipo}</td>
                    <td>
                      <span className={`badge ${item.activo ? 'badge-ae1' : 'badge-rechazada'}`}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-ghost"
                        onClick={() => toggleStatus(item.id, activeTab === 'personal' ? 'personal' : 'servicios_procedencia', item.activo)}
                        style={{ color: 'var(--gray-800)' }}
                      >
                        {item.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .config-container { background: var(--white); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--gray-100); }
        .config-tabs { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid var(--gray-100); }
        .config-tab { padding: 10px 20px; border: none; background: none; cursor: pointer; color: var(--gray-600); font-weight: 500; font-family: var(--font); }
        .config-tab.active { color: var(--blue-600); border-bottom: 2px solid var(--blue-600); }
        .add-item-form { display: flex; gap: 10px; margin-bottom: 24px; padding: 16px; background: var(--gray-50); border-radius: var(--radius); }
        .items-list table { width: 100%; border-collapse: collapse; }
        .items-list th { text-align: left; padding: 12px; border-bottom: 2px solid var(--gray-100); font-size: 12px; color: var(--gray-600); }
        .items-list td { padding: 12px; border-bottom: 1px solid var(--gray-50); font-size: 13px; }
      `}</style>
    </div>
  );
}
