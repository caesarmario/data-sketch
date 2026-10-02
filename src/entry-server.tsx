import { renderToString } from 'react-dom/server';
import App from './App';
import { findRoute } from '../site.routes.mjs';

export function render(pathname = '/') {
  const route = findRoute(pathname);
  if (!route) throw new Error(`Cannot prerender unknown route: ${pathname}`);
  return renderToString(<App route={route} />);
}
