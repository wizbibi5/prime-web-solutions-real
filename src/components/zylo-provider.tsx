'use client';

import { ZyloProvider as ZyloSDKProvider } from '@zylo/sdk-react';
import type { ZyloConfig } from '@zylo/sdk-shared';

const config: ZyloConfig = {
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID ?? 'dev',
  environment: (process.env.NODE_ENV as ZyloConfig['environment']) ?? 'development',
  features: {
    auth: {
      enabled: true,
    },
  },
};

export function ZyloProvider({ children }: { children: React.ReactNode }) {
  return <ZyloSDKProvider config={config}>{children}</ZyloSDKProvider>;
}
