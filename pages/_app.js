import { useEffect } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('SW registrado con éxito:', registration);
        }).catch((error) => {
          console.log('Fallo registro de SW:', error);
        });
      });
    }
  }, []);

  return <Component {...pageProps} />;
}
