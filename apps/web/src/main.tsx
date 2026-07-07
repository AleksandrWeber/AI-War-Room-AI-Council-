import { Suspense, StrictMode, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="app-shell">Loading workspace...</div>}>
      <App />
    </Suspense>
  </StrictMode>,
)
