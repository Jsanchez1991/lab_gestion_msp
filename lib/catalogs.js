import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

export function usePersonal() {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('personal').select('*').eq('activo', true).order('nombre');
    setPersonal(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function add(nombre, cargo = null) {
    const { data } = await supabase
      .from('personal').insert({ nombre, cargo }).select().single();
    await reload();
    return data;
  }

  return { personal, loading, reload, add };
}

export function useProcedencias() {
  const [procedencias, setProcedencias] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data } = await supabase
      .from('servicios_procedencia').select('*').eq('activo', true).order('nombre');
    setProcedencias(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function add(nombre, tipo = 'servicio') {
    const { data } = await supabase
      .from('servicios_procedencia').insert({ nombre, tipo }).select().single();
    await reload();
    return data;
  }

  return { procedencias, loading, reload, add };
}
