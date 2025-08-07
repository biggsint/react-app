import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/common.less'
import App from './App.tsx'

import { AuthProvider } from 'react-oidc-context'
import oidcConfig from './conf/oidcConfig'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider {...oidcConfig}>
        <App />
      </AuthProvider>
  </StrictMode>,
)
