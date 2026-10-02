import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { findRoute } from '../site.routes.mjs';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element is missing');
const route = findRoute(window.location.pathname);
if (!route) throw new Error(`Unknown public route: ${window.location.pathname}`);
const app = <React.StrictMode><App route={route} /></React.StrictMode>;
if (container.querySelector('main')) hydrateRoot(container, app);
else createRoot(container).render(app);
