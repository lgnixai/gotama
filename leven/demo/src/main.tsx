import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@glideapps/glide-data-grid/dist/index.css'
import './index.css'
 
import SimpleDemo from './SimpleDemo.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <SimpleDemo />
  </StrictMode>
)
