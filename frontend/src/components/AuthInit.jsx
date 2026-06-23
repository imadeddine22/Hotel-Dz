'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Restores the user session once on mount. Renders nothing.
 */
export default function AuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
