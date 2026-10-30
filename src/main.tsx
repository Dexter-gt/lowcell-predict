import React from 'react';import {createRoot} from 'react-dom/client';import '@fontsource-variable/figtree';import '@fontsource-variable/jetbrains-mono';import './hooks/useTheme';import './index.css';import App from './App';
createRoot(document.getElementById('root')!).render(<App/>);
