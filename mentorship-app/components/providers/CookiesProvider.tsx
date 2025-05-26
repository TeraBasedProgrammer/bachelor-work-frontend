'use client';

import { ReactNode } from 'react';
import { CookiesProvider as ReactCookiesProvider } from 'react-cookie';

export function CookiesProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <ReactCookiesProvider>{children}</ReactCookiesProvider>;
}
