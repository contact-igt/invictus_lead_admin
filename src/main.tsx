import './styles/tailwind.css';
import { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';

const RootApp = lazy(() => import('./RootApp'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    Loading...
  </div>}>
    <RootApp />
  </Suspense>
);
