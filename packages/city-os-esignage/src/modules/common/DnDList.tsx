import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import React, { memo } from 'react';

import { DnDListDataSource } from '../../libs/type';

import { Container } from './Container';

interface DnDListProps {
  dataSource?: DnDListDataSource[] | [] | null | undefined;
  onChange?: (
    dndlistDataSource: DnDListDataSource[] | [] | null | undefined,
  ) => void | null | undefined;
}

const DnDList: React.VoidFunctionComponent<DnDListProps> = (
  props: DnDListProps,
): JSX.Element | null => {
  const { dataSource, onChange } = props;

  return (
    <DndProvider backend={HTML5Backend}>
      <Container dataSource={dataSource || undefined} onChange={onChange || undefined} />
    </DndProvider>
  );
};

export default memo(DnDList);
