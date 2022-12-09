import Box from '@material-ui/core/Box';
import Image from 'next/image';
import ImageListItem from '@mui/material/ImageListItem';
import React, { CSSProperties, FC, memo } from 'react';
import styled from 'styled-components';

const StyledImg = styled(Image)`
  width: 80px;
  object-fit: 'contain';
`;

export type MediaType = {
  id: string;
  type: string;
  url: string;
};

type CardType = {
  cardInfo: MediaType;
  onUpdateSelectMedia?: () => void;
  styles?: CSSProperties;
};

const MediaCard: FC<CardType> = ({ cardInfo, onUpdateSelectMedia, styles }) => {
  const mediaType = cardInfo?.type?.split('/')[0];

  return (
    <ImageListItem style={{ cursor: 'pointer', ...styles }}>
      <Box display="flex" onClick={onUpdateSelectMedia}>
        {mediaType === 'video' && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls={false} autoPlay muted height="80px" width="100px">
            <source src={cardInfo.url} type={cardInfo.type} />
          </video>
        )}
        {mediaType === 'image' && <StyledImg layout="fill" src={cardInfo.url} />}
      </Box>
    </ImageListItem>
  );
};

export default memo(MediaCard);
