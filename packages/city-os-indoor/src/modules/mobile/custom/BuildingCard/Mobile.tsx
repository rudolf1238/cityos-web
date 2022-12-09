import { makeStyles, useTheme } from '@material-ui/core/styles';

import React, { VoidFunctionComponent, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';

import Img from 'city-os-common/modules/Img';

import type { BuildingEdge } from '../../../../api/getBuildingsOnMobile';

const useStyles = makeStyles((theme) => ({
  cardRoot: {
    height: theme.spacing(12),
    display: 'flex',
    alignItems: 'center',
  },

  cardMedia: {
    height: theme.spacing(12),
    width: theme.spacing(12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
    boxShadow: `${theme.spacing(0, 0.125, 0.5, 0)} rgba(184, 197, 211, 0.25)`,
    backgroundSize: 'cover',
  },
}));

export interface BuildingCardMobileProps {
  building: BuildingEdge['node'];
  handleCardClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    building: BuildingEdge['node'],
  ) => void;
}

const BuildingCardMobile: VoidFunctionComponent<BuildingCardMobileProps> = (
  props: BuildingCardMobileProps,
) => {
  const { building, handleCardClick = (_event, _building) => {} } = props;
  const classes = useStyles();
  const theme = useTheme();

  const imageId = useMemo(() => {
    if (!building.imageIds) return null;
    return building.imageIds?.length > 0 ? building.imageIds[0] : null;
  }, [building.imageIds]);

  const ReadOnlyMapLoading = useMemo(
    () => <Skeleton variant="rect" style={{ width: '100%', height: '100%' }} />,
    [],
  );

  const ReadOnlyMap = useMemo(
    () =>
      dynamic(() => import('../ReadOnlyMap'), {
        loading: () => ReadOnlyMapLoading,
        ssr: false,
      }),
    [ReadOnlyMapLoading],
  );

  const ImageFallback = useMemo(
    () => <ReadOnlyMap lat={building.location?.lat || 0} lng={building.location?.lng || 0} />,
    [ReadOnlyMap, building.location?.lat, building.location?.lng],
  );

  return (
    <Grid item lg={4} md={4} sm={6} xs={12}>
      <Card className={classes.cardRoot}>
        <CardActionArea
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexWrap: 'nowrap',
          }}
          onClick={(event) => handleCardClick(event, building)}
        >
          <CardMedia className={classes.cardMedia} title={building.name}>
            {imageId ? (
              <Img id={imageId} className={classes.image} fallback={ImageFallback} />
            ) : (
              ImageFallback
            )}
          </CardMedia>
          <CardContent style={{ flexGrow: 1, maxWidth: 'calc(100% - 96px)' }}>
            <Typography variant="subtitle1" style={{ marginBottom: theme.spacing(0.5) }} noWrap>
              {building.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p" noWrap>
              {building.desc}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  );
};

export default memo(BuildingCardMobile);
