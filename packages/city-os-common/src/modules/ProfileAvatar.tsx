import React, {
  FunctionComponent,
  PropsWithChildren,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';

import Avatar from '@material-ui/core/Avatar';

import { getImgBase64 } from '../api/getImg';
import { useStore } from '../reducers/index';

export interface AvatarProps {
  username: string | undefined;
  photoId: string | undefined;
  className?: string;
}

const ProfileAvatar: FunctionComponent<PropsWithChildren<AvatarProps>> = (
  props: PropsWithChildren<AvatarProps>,
) => {
  const { username, photoId, className } = props;
  const {
    user,
    userProfile: { permissionGroup },
  } = useStore();

  const [avaterSrc, setAvaterSrc] = useState<string>('');

  const asyncGetImg = useCallback(async () => {
    if (photoId) {
      try {
        const base64Image = await getImgBase64(
          photoId,
          `Bearer ${user.accessToken || ''}`,
          permissionGroup?.group?.id || '',
        );

        if (typeof base64Image === 'string') {
          setAvaterSrc(base64Image);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [photoId, permissionGroup?.group?.id, user.accessToken]);

  useEffect(() => {
    void asyncGetImg();
  }, [asyncGetImg]);

  return <Avatar alt={username} src={avaterSrc} className={className} />;
};

export default memo(ProfileAvatar);
