import type { ReactNode } from 'react';

import { AppNavigation } from './AppNavigation';

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="protected-page">
      <AppNavigation />
      {children}
    </main>
  );
}
