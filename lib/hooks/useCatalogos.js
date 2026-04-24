import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useCatalogos() {
  const [personal, setPersonal] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        supabase.from('personal').select('*').eq('activo', true).order('nombre'),
        supabase.from('servicios_procedencia').select('*').eq('activo', true).order('nombre')
      ]);

      if (pRes.error) throw pRes.error;
      if (sRes.error) throw sRes.error;

      setPersonal(pRes.data || []);
      setServicios(sRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { personal, servicios, loading, error, refresh: fetchData };
}
