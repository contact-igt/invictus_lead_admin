import './styles/tailwind.css';
import { lazy, Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const RootApp = lazy(() => import('./RootApp'));

/**
 * Pre-MUI fallback loader — pure HTML/CSS + React state, no MUI dependency.
 * Reads stored color-mode so the background matches the user's last theme.
 */
const AppLoader = () => {
  const isDark = (() => {
    try { return localStorage.getItem('app-color-mode') === 'dark'; } catch { return false; }
  })();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const timer = setInterval(() => {
      current += current < 40 ? 2.5 : current < 70 ? 1.5 : current < 85 ? 0.8 : 0.2;
      if (current >= 90) { current = 90; clearInterval(timer); }
      setProgress(Math.round(current));
    }, 60);
    return () => clearInterval(timer);
  }, []);

  const bg         = isDark ? '#0A0F0D'               : '#F4F6F5';
  const subColor   = isDark ? '#94A3B8'               : '#4A5C4D';
  const trackColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', backgroundColor: bg,
        fontFamily: '"Space Grotesk", "DM Sans", sans-serif',
      }}
    >
      <style>{`
        @keyframes _igt_fade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes _igt_pulse { 0%,100% { opacity:.8; transform:scale(.97); } 50% { opacity:1; transform:scale(1.03); } }
        ._igt_wrap { display:flex; flex-direction:column; align-items:center; gap:0; animation:_igt_fade 0.45s ease-out both; }
        ._igt_logo { animation:_igt_pulse 2s ease-in-out infinite; }
      `}</style>

      <div className="_igt_wrap">

        {/* Logo */}
        <img
          className="_igt_logo"
          src="/assets/brand-logo.png"
          alt="Invictus"
          style={{ width: 200, height: 'auto', display: 'block', transform: 'scale(1.8)', transformOrigin: 'center center', marginBottom: 24 }}
        />

        {/* Progress bar + percentage */}
        <div style={{ width: 240 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', color: subColor, fontWeight: 500 }}>LOADING</span>
            <span style={{ fontSize: 12, color: '#2E8B57', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: 5, borderRadius: 3, backgroundColor: trackColor, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, backgroundColor: '#2E8B57', width: `${progress}%`, transition: 'width 0.08s linear' }} />
          </div>
        </div>

      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<AppLoader />}>
    <RootApp />
  </Suspense>
);
