import { makeStyles, useTheme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Grid, { GridSize } from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';

import { useStore } from 'city-os-common/reducers';

import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useQuery } from '@apollo/client';

import FormControl from '@mui/material/FormControl';

import { Color } from 'material-ui-color';
import clsx from 'clsx';

import Typography from '@material-ui/core/Typography';

import I18nProvider from '../I18nESignageProvider';

import useESignageTranslation from '../../hooks/useESignageTranslation';

import ColorPickerComponent from '../common/ColorPicker';

import ESignageTemplateImage from '../ESignageTemplateImage';

import { ESignageTemplateSize, ESignageTemplateType, TemplateBasic } from '../../libs/type';

import {
  DivsionOutput,
  GET_DIVISION,
  GetDivisionPayload,
  GetDivisionResponse,
} from '../../api/getDivision';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '56%',
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    overflow: 'overflow-y',
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  kanbanBox: {
    height: 486
  },
  disabledInput: {
    '& .MuiInputBase-root.Mui-disabled': {
      color: 'red',
    },
  },
  templateBox: {
    position: 'relative',
  },
  textFieldMarginBottom: {
    marginBottom: theme.spacing(2),
  },
  textLeft: {
    textAlign: 'left',
  },
  paperPadding: {
    padding: theme.spacing(1),
  },
}));

interface TemplateProps {
  adjustTemplateInfoRoot?: string;
  adjustKanbanBoxHeight?: string,
  setGridSMSize?: GridSize | boolean | undefined;
  templateIndex: number;
  templateTypeId: string;
  templateTitle?: string | undefined;
  templateBasic?: TemplateBasic | undefined;
  displayBasicInfo?: boolean | undefined;
  imageButtonWidth?: number | undefined;
  imageButtonHeight?: number | undefined;
  onTemplateBasicChanged?: (newtemplateBasicInfo: TemplateBasic) => void | null | undefined;
}

const TemplateInfo: VoidFunctionComponent<TemplateProps> = (props: TemplateProps) => {
  const {
    adjustTemplateInfoRoot,
    adjustKanbanBoxHeight,
    setGridSMSize = 6,
    templateIndex,
    templateTypeId,
    templateTitle,
    templateBasic,
    displayBasicInfo = true,
    imageButtonWidth,
    imageButtonHeight,
    onTemplateBasicChanged,
  } = props;
  const [index, setIndex] = useState(templateIndex);
  const [title, setTitle] = useState(templateTitle || '');
  const classes = useStyles();
  const { t } = useESignageTranslation(['esignage']);
  const width = imageButtonWidth || `100%`;
  const height = imageButtonHeight || 420;
  const [imageWidth, setImageWidth] = useState<number | string>(0); // 160
  const [imageHeight, setImageHeight] = useState<number>(0); // 160
  const {
    userProfile: { permissionGroup },
  } = useStore();

  const [divisionDataSource, setDivisionDataSource] = useState<DivsionOutput[] | undefined>(
    undefined,
  );
  const [isInit, setIsInit] = useState<boolean>(true);
  const [resolutionDefaultValue, setResolutionDefaultValue] = useState('');
  const theme2 = useTheme();

  // 此處 useQuery 必須在templateBasicInfo之前,否則useEffect中divisionDataSource為undefined
  useQuery<GetDivisionResponse, GetDivisionPayload>(GET_DIVISION, {
    variables: {
      groupId: permissionGroup?.group.id || '',
      filter: {},
    },
    onCompleted: (divisionDataObject) => {
      if (divisionDataObject !== undefined) {
        setDivisionDataSource(divisionDataObject.getDivision.divisionOutput);
      }
    },
    onError: (/* error */) => {
      // if (D_DEBUG) console.error(error.graphQLErrors);
    },
    skip: !permissionGroup?.group.id,
  });

  const [templateBasicInfo, setTemplateBasicInfo] = useState<TemplateBasic>(() => {
    if (templateBasic !== undefined) {
      return templateBasic;
    }
    const templateTypeCode = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const templateBasicInfoLocal: TemplateBasic = {
      templateName: '',
      templateType: '',
      groupId: '',
      description: '',
      backgroundColor: 'FF0000',
    };
    if (templateIndex !== undefined && templateIndex > -1) {
      templateBasicInfoLocal.templateName = String().concat(
        t('Template'),
        ' ',
        templateTypeCode[templateIndex],
      );
    }
    if (templateTypeId !== undefined) {
      templateBasicInfoLocal.templateType = templateTypeId;
    }
    if (divisionDataSource !== undefined && divisionDataSource.length > 0) {
      templateBasicInfoLocal.groupId = divisionDataSource[0].id;
    }
    return templateBasicInfoLocal;
  });

  const handleTemplateNameChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setTemplateBasicInfo({ ...templateBasicInfo, templateName: e.target.value });
    },
    [templateBasicInfo],
  );

  const handleDivisionChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setTemplateBasicInfo({ ...templateBasicInfo, groupId: e.target.value });
    },
    [templateBasicInfo],
  );

  const handleDescriptionChanged = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setTemplateBasicInfo({ ...templateBasicInfo, description: e.target.value });
    },
    [templateBasicInfo],
  );

  const handleOnColorChanged = useCallback(
    (newColorVaule: Color) => {
      setTemplateBasicInfo({ ...templateBasicInfo, backgroundColor: newColorVaule.hex });
    },
    [templateBasicInfo],
  );

  const ESignageTemplateImageComponent = useCallback((indexLocal: number) => {
    switch (indexLocal) {
      case 0:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_A_1080X1920}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 1:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_B_1080X1920}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 2:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_C_1080X1920}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 3:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_D_1080X1920}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 4:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_E_1080X1920}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 5:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_F_1080X1920}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 6:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_G_1920X1080}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 7:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_H_1920X1080}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 8:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_I_1920X1080}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 9:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_J_1920X1080}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 10:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_K_1920X1080}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      case 11:
        return (
          <ESignageTemplateImage
            type={ESignageTemplateType.TYPE_L_1920X1080}
            size={ESignageTemplateSize.DEFAULT}
          />
        );
      default:
        return null;
    }
  }, []);

  useMemo(() => {
    setImageWidth(width);
    setImageHeight(height);
  }, [height, width]);

  useEffect(() => {
    if (isInit) {
      setIndex(templateIndex);
      setTitle(templateTitle || '');

      if (templateIndex !== undefined && templateIndex > -1) {
        if (templateIndex >= 0 && templateIndex <= 5) {
          setResolutionDefaultValue('1080x1920');
        } else if (templateIndex >= 6 && templateIndex <= 11) {
          setResolutionDefaultValue('1920x1080');
        }
      }
      if (divisionDataSource !== undefined && divisionDataSource.length > 0) {
        if (templateBasic === undefined || templateBasicInfo?.groupId === '') {
          setTemplateBasicInfo({ ...templateBasicInfo, groupId: divisionDataSource[0].id });
          setIsInit(false);
        }
      }
    }
  }, [divisionDataSource, isInit, templateBasic, templateBasicInfo, templateIndex, templateTitle]);

  useEffect(() => {
    if (onTemplateBasicChanged !== undefined) onTemplateBasicChanged(templateBasicInfo);
  }, [onTemplateBasicChanged, templateBasicInfo]);

  return (
    <I18nProvider>
      <div className={clsx(classes.root, adjustTemplateInfoRoot)} >
        <Grid container item>
          <Grid item xs={12} sm={setGridSMSize}>
            <Paper
              elevation={1}
              className={clsx(classes.paperPadding, classes.kanbanBox, adjustKanbanBoxHeight)}
            >
              <Typography variant="subtitle2" gutterBottom>{title}</Typography>
              <Box
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                className={clsx(classes.templateBox)}
              >
                {index > -1 ? ESignageTemplateImageComponent(index) : <div />}
              </Box>
            </Paper>
          </Grid>
          {displayBasicInfo ? (
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={1}
                className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
              >
                <Paper
                  elevation={1}
                  className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
                >
                  <TextField
                    required
                    id="templateName"
                    variant="outlined"
                    label={t('Template Name')}
                    defaultValue={templateBasicInfo.templateName}
                    value={templateBasicInfo.templateName}
                    fullWidth
                    onChange={handleTemplateNameChanged}
                    inputProps={{
                      style: { color: theme2.palette.type === 'dark' ? '#fff' : '#182245' },
                    }}
                    error={templateBasicInfo && templateBasicInfo.templateName === ''}
                    helperText={
                      templateBasicInfo && templateBasicInfo.templateName === ''
                        ? t("Template name can't be empty.")
                        : ' '
                    }
                  />
                </Paper>
                <Paper
                  elevation={1}
                  className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
                >
                  <FormControl fullWidth>
                    <TextField
                      select
                      required
                      id="divisionSelect"
                      value={templateBasicInfo.groupId}
                      label={t('Division')}
                      className={clsx(classes.textLeft)}
                      onChange={handleDivisionChanged}
                    >
                      {divisionDataSource &&
                        divisionDataSource?.map((division: DivsionOutput) => (
                          <MenuItem key={division.id} value={division.id}>
                            {division.groupName}
                          </MenuItem>
                        ))}
                    </TextField>
                  </FormControl>
                </Paper>
                <Paper
                  elevation={1}
                  className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
                >
                  <TextField
                    required
                    disabled
                    id="resolution"
                    label={t('Resolution')}
                    value={resolutionDefaultValue}
                    fullWidth
                    className={clsx(classes.disabledInput)}
                  />
                </Paper>
                <Paper
                  elevation={1}
                  className={clsx(classes.paperPadding, classes.textFieldMarginBottom)}
                >
                  <TextField
                    id="descriptionStatic"
                    variant="outlined"
                    label={t('Description')}
                    multiline
                    rows={3}
                    defaultValue={templateBasicInfo.description}
                    value={templateBasicInfo.description}
                    fullWidth
                    onChange={handleDescriptionChanged}
                    placeholder={t('Description')}
                />
                </Paper>
                <Paper
                  elevation={1}
                  className={clsx(classes.paperPadding)}
                >
                  <ColorPickerComponent
                    displayName={t('Background Color')}
                    selectedColor={templateBasicInfo.backgroundColor}
                    onChangeColor={handleOnColorChanged}
                  />
                </Paper>
              </Paper>
            </Grid>
          ) : null}
        </Grid>
      </div>
    </I18nProvider>
  );
};

export default memo(TemplateInfo);
