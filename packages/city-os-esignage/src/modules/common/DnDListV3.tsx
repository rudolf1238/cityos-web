import * as React from 'react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Menu } from 'baseui/icon';
import { StatefulList } from 'baseui/dnd-list';
import { useStyletron } from 'baseui';
import CardMedia from '@material-ui/core/CardMedia';
import { DnDListMediaDataSource } from '../../libs/type';

const useStyles = makeStyles((theme) => ({
  statefulList: {
    '& li': {
      wordWrap: 'break-word',
      wordBreak: 'break-all',
      backgroundColor: theme.palette.type === 'dark' ? theme.palette.background.default : theme.palette.primary.contrastText,
      color: theme.palette.type === 'dark' ? theme.palette.info.main : theme.palette.text.primary,
      textAlign: 'left',
    }
  },
  cardMediaText: {
    width: 'calc(100% - 60px)',
    marginLeft: theme.spacing(1)
  }
}));

const CustomDragHandle = () => {
  const [css] = useStyletron();
  return (
    <div
      className={css({
        marginRight: '1em',
        width: '24px',
        display: 'flex',
        alignItems: 'center',
      })}
    >
      <Menu size={24} color="#CCC" />
    </div>
  );
};
interface DnDListProps {
  dataSource?: DnDListMediaDataSource[] | [] | null | undefined;
  setDataSource?: React.Dispatch<React.SetStateAction<DnDListMediaDataSource[]>>;
  removeContentInfo?: (oldIndex: number) => void | null | undefined;
  moveContentInfo?: (startIndex: number, endIndex: number) => void | null | undefined;
  onChange?: (
    dndlistDataSource: DnDListMediaDataSource[] | [] | null | undefined,
  ) => void | null | undefined;
}

const DnDListV3: React.VoidFunctionComponent<DnDListProps> = (
  props: DnDListProps,
): JSX.Element | null => {
  const classes = useStyles();
  const { dataSource, setDataSource, removeContentInfo, moveContentInfo, onChange } = props;
  const tempList: DnDListMediaDataSource[] = useMemo((): DnDListMediaDataSource[] => [], []);
  const [size] = useState(60);

  const handleRefreshItemList = useCallback(() => {
    const itemListLocal: React.ReactNode[] = [];
    if (dataSource !== undefined && dataSource !== null && dataSource?.length > 0) {
      dataSource.forEach((element) => {
        if (
          element !== undefined &&
          element.content !== undefined &&
          element.content.type === 'video/mp4'
        ) {
          itemListLocal.push(
            <div style={{ display: 'flex', textAlign: 'center', alignItems: 'center' }}>
              <div style={{ height: size, width: size }}>
                <CardMedia
                  component="video"
                  image={URL.createObjectURL(element.content)}
                  autoPlay
                />
              </div>
              <div style={{ marginLeft: 5 }}>{element.text}</div>
            </div>,
          );
        } else if (
          element !== undefined &&
          element.content !== undefined &&
          (element.content.type === 'image/png' ||
            element.content.type === 'image/jpg' ||
            element.content.type === 'image/jpeg')
        ) {
          itemListLocal.push(
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ height: size, width: size }}>
                <CardMedia component="img" image={URL.createObjectURL(element.content)} />
              </div>
              <div className={classes.cardMediaText}>{element.text}</div>
            </div>,
          );
        } else {
          itemListLocal.push(element.text);
        }
      });
    } else if (tempList !== undefined && tempList !== null) {
      tempList.forEach((element) => {
        itemListLocal.push(element.text);
      });
    }
    return itemListLocal;
  }, [dataSource, size, tempList]);

  const [itemList, setItemList] = useState<React.ReactNode[]>(() => {
    const itemListLocal: React.ReactNode[] = [...handleRefreshItemList()];
    return itemListLocal;
  });

  const [cards, setCards] = useState(dataSource || tempList);

  const reorder = (
    list: DnDListMediaDataSource[],
    startIndex: number,
    endIndex: number,
  ): DnDListMediaDataSource[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const moveItem = useCallback(
    (params: { newState: React.ReactNode[]; oldIndex: number; newIndex: number }) => {
      if (params !== undefined && params.oldIndex > -1 && params.newIndex > -1) {
        if (cards !== undefined && cards !== null && cards.length > 0) {
          try {
            let tempCards: DnDListMediaDataSource[] = [...cards];
            tempCards = reorder(tempCards, params.oldIndex, params.newIndex);
            setCards(tempCards);
            if (moveContentInfo !== undefined) moveContentInfo(params.oldIndex, params.newIndex);
            // console.info(moveContentInfo);
          } catch (e) {
            // console.info(e);
          }
        }
      }
    },
    [cards, moveContentInfo /* , setDataSource */],
  );

  const removeItem = useCallback(
    (params: { newState: React.ReactNode[]; oldIndex: number }) => {
      // console.log(params.oldIndex.toString());
      if (params !== undefined && params.oldIndex > -1) {
        if (cards !== undefined && cards !== null && cards.length > 0) {
          try {
            const tempCards: DnDListMediaDataSource[] = [...cards];
            tempCards.splice(params.oldIndex, 1);
            setCards(tempCards);
            if (setDataSource !== undefined) setDataSource(tempCards);
            if (removeContentInfo !== undefined) removeContentInfo(params.oldIndex);
          } catch (e) {
            // console.info(e);
          }
        }
      }
    },
    [cards, removeContentInfo, setDataSource],
  );

  useEffect(() => {
    if (!dataSource /* || dataSource?.length <= 0 */) return;
    const itemListLocal: React.ReactNode[] = [...handleRefreshItemList()];
    setItemList(itemListLocal);
    
  }, [cards, dataSource, handleRefreshItemList]);

  const [isHidden, setIsHidden] = React.useState<boolean>(false);

  useEffect(() => {
    setCards(dataSource || []);
    setIsHidden(true);
    setTimeout(() => {
      setIsHidden(false);
    }, 50);
  }, [dataSource]);

  useEffect(() => {
    if (onChange !== undefined) onChange(cards);
  }, [cards, onChange]);
  
  return (
    isHidden
      ? null
      : (
        <div className={classes.statefulList}>
          <StatefulList
            removable
            initialState={{
              items: itemList,
            }}
            overrides={{
              DragHandle: CustomDragHandle,
            }}
            onChange={(params) =>
              params !== undefined && params.newIndex === -1 ? removeItem(params) : moveItem(params)
            }
          />
        </div>
      )
  )
};

export default memo(DnDListV3);
