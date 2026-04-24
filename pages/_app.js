import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import '../styles/globals.css';
import Login from '../components/Login';

export default function App({ Component, pageProps }) {
  const [session, setSession] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setFetching(false);
    });

    // 2. Escuchar cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setFetching(false);
    });

    // 3. Registro de Service Worker (PWA)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW fail', err));
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  if (fetching) {
    return (
      <div className="login-page">
        <div style={{ color: 'white', fontWeight: 500 }}>Iniciando LabGestión...</div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <Component {...pageProps} session={session} />;
}
