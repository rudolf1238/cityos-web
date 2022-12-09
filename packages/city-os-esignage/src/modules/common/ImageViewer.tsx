import { makeStyles, useTheme } from '@material-ui/core/styles';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import React, {
  VoidFunctionComponent,
  createRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ESignageTemplateSize,
  ESignageTemplateType,
  ImageDataSource,
  RWDCtrl,
} from '../../libs/type';
import ESignageTemplateImage from '../ESignageTemplateImage';
import I18nProvider from '../I18nESignageProvider';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'overflow-y',
    backgroundColor: theme.palette.background.paper,
  },
}));

const Item = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

interface ImageViewerProps {
  dataSource?: ImageDataSource[] | [] | null | undefined;
  resetUI?: boolean | null | undefined;
  selectedIndex?: number | undefined;
  idMappingReference?: string[] | undefined /* 用於比對id對應表方式, 顯示特定圖示 */;
  RWDCtrlInfo?: RWDCtrl | undefined /* 控制RWD基本參數 */;
  bindImageComponent?: (index: number) => JSX.Element | null | void | undefined;
  onChangeIndex?: (imgSelectedIndex: number) => void | null | undefined;
}

const ImageViewer: VoidFunctionComponent<ImageViewerProps> = (props: ImageViewerProps) => {
  const {
    dataSource,
    resetUI,
    selectedIndex,
    idMappingReference,
    RWDCtrlInfo,
    bindImageComponent,
    onChangeIndex,
  } = props;
  const [templateDataCounter, setTemplateDataCounter] = useState<number>(0);
  const [initSelectedIndex, setInitSelectedIndex] = useState<boolean>(true);
  const selectedIndexRef = useRef(selectedIndex || -1);
  const width = RWDCtrlInfo && RWDCtrlInfo?.width > 0 ? RWDCtrlInfo?.width : 160;
  const height = RWDCtrlInfo && RWDCtrlInfo?.height > 0 ? RWDCtrlInfo?.height : 160;
  const sm = RWDCtrlInfo && RWDCtrlInfo?.sm > 0 ? RWDCtrlInfo?.sm : 6;
  const md = RWDCtrlInfo && RWDCtrlInfo?.md > 0 ? RWDCtrlInfo?.md : 4;
  const lg = RWDCtrlInfo && RWDCtrlInfo?.lg > 0 ? RWDCtrlInfo?.lg : 2;
  const [imageWidth, setImageWidth] = useState<number>(0); // 160
  const [imageHeight, setImageHeight] = useState<number>(0); // 160
  const classes = useStyles();
  const [rowImageItems, setRowImageItems] = useState<number>(6);
  const [rows, setRows] = useState<number>(6);
  const [inputRef, setInputRef] = useState<React.RefObject<HTMLDivElement>[]>([]);
  const [gridContainerItems, setGridContainerItems] = useState<number[]>([]);
  const [gridItemButtons, setGridItemButtons] = useState<number[]>([]);
  const theme2 = useTheme();

  const handleResetBorder = useCallback(() => {
    if (inputRef !== undefined && inputRef !== null) {
      let i = 0;
      for (i = 0; i < inputRef.length; i += 1) {
        if (inputRef[i].current !== undefined && inputRef[i].current !== null) {
          const HTMLDiv = inputRef[i].current as unknown as HTMLDivElement;
          HTMLDiv.style.border = '0px solid red';
        }
      }
    }
  }, [inputRef]);

  const handleResetUI = useCallback(() => {
    selectedIndexRef.current = -1;
    if (onChangeIndex !== undefined) onChangeIndex(selectedIndexRef.current);
    handleResetBorder();
  }, [handleResetBorder, onChangeIndex]);

  const handleMouseEnter = useCallback(
    (index: number, e: React.MouseEvent<HTMLDivElement>) => {
      const HTMLDiv = e.currentTarget as unknown as HTMLDivElement;
      // console.log('handleMouseEnter');
      if (selectedIndexRef.current === -1) {
        if (selectedIndexRef.current !== index) {
          handleResetBorder();
        }
      }

      if (index < templateDataCounter && index > -1) {
        HTMLDiv.style.border = '1px solid red';
      }
    },
    [handleResetBorder, templateDataCounter],
  );

  const handleMouseLeave = useCallback(
    (index: number, e: React.MouseEvent<HTMLDivElement>) => {
      const HTMLDiv = e.currentTarget as unknown as HTMLDivElement;
      // console.log('handleMouseLeave');
      if (selectedIndexRef.current === -1) {
        handleResetBorder();
      } else if (selectedIndexRef.current !== index) {
        if (index < templateDataCounter && index > -1) {
          HTMLDiv.style.border = '0px solid red';
        }
      }
    },
    [handleResetBorder, templateDataCounter],
  );

  const handleMouseDown = useCallback(
    (index: number, e: React.MouseEvent<HTMLDivElement>) => {
      const HTMLDiv = e.currentTarget as unknown as HTMLDivElement;
      // console.log('handleMouseDown');
      if (selectedIndexRef.current === -1 || selectedIndexRef.current !== index) {
        if (selectedIndexRef.current !== index) {
          handleResetBorder();
        }
        selectedIndexRef.current = index;

        if (onChangeIndex !== undefined) onChangeIndex(selectedIndexRef.current);

        // console.log(String().concat('selectedIndex:', selectedIndexRef.current.toString()));
        if (index < templateDataCounter && index > -1) {
          HTMLDiv.style.border = '1px solid red';
        }
      } else {
        handleResetUI();
      }
    },
    [handleResetBorder, handleResetUI, onChangeIndex, templateDataCounter],
  );

  useMemo(() => {
    if (dataSource !== null) setTemplateDataCounter(dataSource?.length || 0);

    const inputRefTmp = new Array<React.RefObject<HTMLDivElement>>(templateDataCounter);
    const gridContainerItemsTmp = new Array<number>(rows);
    const gridItemButtonsTmp = new Array<number>(
      rowImageItems > 0 && (rowImageItems <= 6 || rowImageItems === templateDataCounter)
        ? rowImageItems
        : 6,
    );

    let i = 0;
    for (i = 0; i < inputRefTmp.length; i += 1) {
      inputRefTmp[i] = createRef();
    }
    setInputRef(inputRefTmp);

    for (i = 0; i < rows; i += 1) {
      gridContainerItemsTmp[i] = i;
    }
    setGridContainerItems(gridContainerItemsTmp);

    if (rowImageItems <= 0 || (rowImageItems > 6 && rowImageItems < templateDataCounter))
      setRowImageItems(6);

    for (i = 0; i < rowImageItems; i += 1) {
      gridItemButtonsTmp[i] = i;
    }
    setGridItemButtons(gridItemButtonsTmp);
    setImageWidth(width);
    setImageHeight(height);
    setRows(
      Math.ceil(
        templateDataCounter /
          (rowImageItems > 0 && (rowImageItems <= 6 || rowImageItems === templateDataCounter)
            ? rowImageItems
            : 6),
      ),
    );
  }, [dataSource, height, rowImageItems, rows, templateDataCounter, width]);

  const ESignageTemplateImageComponent = useCallback((index: number) => {
    switch (index) {
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

  useEffect(() => {
    if (selectedIndex !== undefined) {
      if (initSelectedIndex) {
        setInitSelectedIndex(false);
        handleResetUI();
        if (inputRef !== undefined && selectedIndex < inputRef.length && selectedIndex > -1) {
          if (
            inputRef[selectedIndex].current !== undefined &&
            inputRef[selectedIndex].current !== null
          ) {
            selectedIndexRef.current = selectedIndex;
            if (onChangeIndex !== undefined) onChangeIndex(selectedIndexRef.current);
            const HTMLDiv = inputRef[selectedIndex].current as unknown as HTMLDivElement;
            HTMLDiv.style.border = '1px solid red';
          }
        }
      }
    } else if (resetUI !== undefined && resetUI) handleResetUI();
  }, [handleResetUI, initSelectedIndex, inputRef, onChangeIndex, resetUI, selectedIndex]);
  
  const renderGirdSize = (size: number | undefined, colSize: number = 12): number => {
    return size ? size : colSize;
  }
  
  return (
    <I18nProvider>
      <div className={classes.root}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={1}>
            {gridContainerItems.map((row) => (
              <Grid container item spacing={2} key={row.toString()}>
                {gridItemButtons.map(
                  (col) =>
                    col + row * rowImageItems < templateDataCounter && (
                      <Grid
                        item
                        xs={renderGirdSize(RWDCtrlInfo?.sm)}
                        sm={renderGirdSize(RWDCtrlInfo?.sm, 2)}
                        key={(col + row * rowImageItems).toString()}
                      >
                        <Item
                          ref={inputRef[col + row * rowImageItems]}
                          onMouseEnter={(e) => handleMouseEnter(col + row * rowImageItems, e)}
                          onMouseLeave={(e) => handleMouseLeave(col + row * rowImageItems, e)}
                          onMouseDown={(e) => handleMouseDown(col + row * rowImageItems, e)}
                          style={{
                            backgroundColor: theme2.palette.type === 'dark' ? '#182245' : '#fff',
                            borderRadius: theme2.shape.borderRadius,
                            border: `1px solid ${theme2.palette.gadget.frame}`,
                          }}
                        >
                          <div
                            style={{ color: theme2.palette.type === 'dark' ? '#fff' : '#182245' }}
                          >
                            {dataSource && dataSource[col + row * rowImageItems]?.title}
                          </div>
                          <ButtonBase
                            sx={{
                              width: imageWidth,
                              height: imageHeight,
                            }}
                            style={{
                              backgroundColor: theme2.palette.type === 'dark' ? '#182245' : '#fff',
                              borderRadius: theme2.shape.borderRadius,
                            }}
                          >
                            {bindImageComponent ||
                              (idMappingReference && idMappingReference.length > 0 && dataSource
                                ? idMappingReference.indexOf(
                                    dataSource[col + row * rowImageItems]?.id,
                                  ) > -1 &&
                                  ESignageTemplateImageComponent(
                                    idMappingReference.indexOf(
                                      dataSource[col + row * rowImageItems]?.id,
                                    ),
                                  )
                                : ESignageTemplateImageComponent(col + row * rowImageItems))}
                            {bindImageComponent &&
                              (idMappingReference && idMappingReference.length > 0 && dataSource
                                ? idMappingReference.indexOf(
                                    dataSource[col + row * rowImageItems]?.id,
                                  ) > -1 &&
                                  bindImageComponent(
                                    idMappingReference.indexOf(
                                      dataSource[col + row * rowImageItems]?.id,
                                    ),
                                  )
                                : bindImageComponent(col + row * rowImageItems))}
                          </ButtonBase>
                          <div
                            style={{ color: theme2.palette.type === 'dark' ? '#fff' : '#182245' }}
                          >
                            {dataSource && dataSource[col + row * rowImageItems]?.description}
                          </div>
                        </Item>
                      </Grid>
                    ),
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
    </I18nProvider>
  );
};

export default memo(ImageViewer);
