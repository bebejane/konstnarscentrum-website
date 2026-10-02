import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

let root: ReturnType<typeof createRoot> | undefined;

export function render(component: React.ReactNode): void {
  if (!root) {
    const container = document.getElementById('root');
    root = createRoot(container!);
  }
  root.render(<StrictMode>{component}</StrictMode>);
}
