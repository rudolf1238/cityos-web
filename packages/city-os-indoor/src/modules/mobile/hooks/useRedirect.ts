import { useCallback } from 'react';
import { useRouter } from 'next/router';

interface UseRedirect {
  to: (pathname: string, query?: Record<string, string>, skip?: unknown) => Promise<boolean> | null;
  back: () => void;
  toNotFoundPage: () => Promise<boolean>;
}

const useRedirect = (): UseRedirect => {
  const router = useRouter();

  const to = useCallback(
    (pathname: string, query?: Record<string, string>, skip?: unknown) => {
      if (skip)
        return new Promise<boolean>((resolve) => {
          resolve(false);
        });
      return !query ? router.push(pathname) : router.push({ pathname, query });
    },
    [router],
  );

  const back = useCallback(() => router.back(), [router]);

  const toNotFoundPage = useCallback(() => {
    return to('/404');
  }, [to]);

  return { to, back, toNotFoundPage };
};

export default useRedirect;
