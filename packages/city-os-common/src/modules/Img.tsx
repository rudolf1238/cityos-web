import React, {
  FunctionComponent,
  HTMLAttributes,
  PropsWithChildren,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getImgBase64 } from '../api/getImg';
import { useStore } from '../reducers/index';
import useIsMountedRef from '../hooks/useIsMountedRef';

export interface ImgProps {
  id: string;
  imgProps?: HTMLAttributes<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

const Img: FunctionComponent<PropsWithChildren<ImgProps>> = (
  props: PropsWithChildren<ImgProps>,
) => {
  const { id, imgProps, className, children, style, fallback = null } = props;
  const isMountedRef = useIsMountedRef();
  const {
    user,
    userProfile: { permissionGroup },
  } = useStore();

  const imgRef = useRef<HTMLDivElement | null>(null);

  const [errorFlag, setErrorFlag] = useState<boolean>(false);

  const asyncGetImg = useCallback(async () => {
    try {
      if (!id) {
        throw new Error('id is required');
      }
      const base64Image = await getImgBase64(
        id,
        `Bearer ${user.accessToken || ''}`,
        permissionGroup?.group?.id || '',
      );

      if (
        imgRef !== null &&
        imgRef.current !== null &&
        typeof base64Image === 'string' &&
        isMountedRef.current
      ) {
        imgRef.current.style.backgroundImage = `url("${base64Image}")`;
      } else {
        throw new Error('base64Image is not string');
      }
    } catch {
      if (isMountedRef.current) setErrorFlag(true);
    }
  }, [id, isMountedRef, permissionGroup?.group?.id, user.accessToken]);

  useEffect(() => {
    void asyncGetImg();
  }, [asyncGetImg]);

  return errorFlag ? (
    <div>{fallback}</div>
  ) : (
    <div ref={imgRef} style={style} className={className} {...imgProps}>
      {children}
    </div>
  );
};

export default memo(Img);
