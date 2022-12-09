import { styled } from '@material-ui/core/styles';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { useStore } from 'city-os-common/reducers';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';

import useWifiTranslation from '../hooks/useWifiTranslation';

import { GET_AD_ON_WIFI, GetAdPayload, GetAdResponse } from '../api/getAdOnWifi';
import { IArea } from '../libs/schema';
import { PartialAdNode } from '../api/searchAdsOnWifi';
import {
  SEARCH_AREAS_ON_WIFI,
  SearchAreasPayload,
  SearchAreasResponse,
} from '../api/searchAreasOnWifi';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

// const useStyles = makeStyles(() => ({
//   button: {
//     float: 'right',
//   },
// }));

interface InputProps {
  open: boolean;
  companyId: string;
  adId: string;
  onClose: () => void;
}
interface AreaNode {
  id: string;
  name: string;
}

const AdDetail: FunctionComponent<InputProps> = ({
  companyId,
  adId,
  open,
  onClose,
}: InputProps) => {
  const { t } = useWifiTranslation(['wifi', 'common']);
  const {
    userProfile: { permissionGroup },
  } = useStore();

  const [searchData, setSearchData] = useState<PartialAdNode>(Object);
  const [areaNodes, setAreaNodes] = useState<AreaNode[]>([]);
  const [arealists, setArealists] = useState<string[]>([]);
  // const classes = useStyles();
  const { reset } = useForm<IArea>({
    defaultValues: {
      // data from parent form
      id: adId,
      name: '',
      serviceStartDate: undefined,
      serviceEndDate: undefined,
    },
    mode: 'onChange',
  });
  useQuery<SearchAreasResponse, SearchAreasPayload>(SEARCH_AREAS_ON_WIFI, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      companyId,
      filter: {},
    },
    skip: !permissionGroup?.group.id,
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getAreaList }) => {
      const areaNode: AreaNode[] = getAreaList.areas.map((area) => ({
        id: area.node.id,
        name: area.node.name,
      }));
      setAreaNodes(areaNode);
    },
  });

  useQuery<GetAdResponse, GetAdPayload>(GET_AD_ON_WIFI, {
    variables: {
      groupId: permissionGroup?.group.id,
      companyId,
      id: adId,
    },
    fetchPolicy: 'cache-and-network',
    onCompleted: ({ getAd }) => {
      setSearchData(getAd.node);
    },
  });

  useEffect(() => {
    if (areaNodes.length > 0 && searchData.id) {
      const copy: string[] = [];
      areaNodes.forEach((aaa) => {
        if (searchData.area_list.includes(parseInt(aaa.id, 10))) {
          copy.push(aaa.name);
        }
      });
      setArealists(copy);
    }
  }, [arealists, areaNodes, searchData]);

  const handleOnClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const allArea = t('wifi:All Area');

  return (
    <div>
      {searchData.name && (
        <BootstrapDialog open={open} onClose={handleOnClose} fullWidth>
          <DialogTitle>
            <Typography variant="h4" style={{ textAlign: 'center' }}>
              {searchData.name}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Typography variant="h6" style={{ paddingLeft: '15px' }}>
              {searchData.pricing_type === 1
                ? t('wifi:Paid Advertising')
                : t('wifi:Free Advertising')}
            </Typography>

            <DialogContentText style={{ paddingLeft: '20px' }}>
              <Typography component="ul" variant="h6">
                <li>
                  {t('wifi:Advertisement Id')}
                  {searchData.id}
                </li>
                <li>
                  {t('wifi:Company Name')} : {searchData.company_name}
                </li>
                <li>
                  {t('wifi:Minimum Views(Seconds)')} : {searchData.min_view_time}
                </li>
                <li>
                  {t('wifi:Weight')} : {searchData.weight}
                </li>
                {searchData.link_type === 1 && (
                  <li>
                    {t('wifi:Url')} : {searchData.url}
                  </li>
                )}
                {searchData.pricing_type === 1 && (
                  <>
                    <li>
                      {t('wifi:Click Limit')} : {searchData.click_qty}
                    </li>
                    <li>
                      {t('wifi:Daily Click Limit')} : {searchData.daily_click_qty}
                    </li>
                    <li>
                      {t('wifi:Cost per Click')} : {searchData.cost_per_click}
                    </li>
                  </>
                )}
                <li>
                  {t('wifi:Service Start Date')} : {searchData.start_datetime}
                </li>
                <li>
                  {t('wifi:Service End Date')} : {searchData.end_datetime}
                </li>
                <li>
                  {t('wifi:Start Time Slot')} : {searchData.start_timeslot}
                </li>
                <li>
                  {t('wifi:End Time Slot')} : {searchData.end_timeslot}
                </li>
                <li>
                  {t('wifi:Ad Play Area')} :
                  {searchData.area_list.length === 1 &&
                  searchData.area_list[0].toString() === companyId
                    ? allArea
                    : arealists.map((area, index) => {
                        return index === arealists.length - 1
                          ? ` ${area.toString()}`
                          : ` ${area.toString()} / `;
                      })}
                </li>
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions style={{ marginRight: '20px' }}>
            <Button size="large" onClick={handleOnClose}>
              {t('wifi:close')}
            </Button>
          </DialogActions>
        </BootstrapDialog>
      )}
    </div>
  );
};

export default AdDetail;
