import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Credenciales incorrectas' : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">MSP</div>
        <h1 className="login-title">LabGestión</h1>
        <p className="login-sub">Sistema de Gestión de Muestras</p>
        
        <form onSubmit={handleLogin}>
          {error && <div className="error-banner" style={{ marginBottom: 20 }}>{error}</div>}
          
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', height: 44, marginTop: 10 }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          © 2024 LabGestión MSP · Coordinación Zonal
        </div>
      </div>
    </div>
  );
}
