import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const usePreviousRoute = () => {
  const { asPath } = useRouter();

  const ref = useRef<string | null>(null);

  useEffect(() => {
    ref.current = asPath;
  }, [asPath]);

  return ref.current;
};

export default usePreviousRoute;
