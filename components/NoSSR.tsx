'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const NoSSRWrapper = ({ children, fallback }: NoSSRProps) => {
  return <>{children}</>;
};

// Disable SSR for this component
const NoSSR = dynamic(() => Promise.resolve(NoSSRWrapper), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>Loading...</div>
    </div>
  ),
});

export default NoSSR;