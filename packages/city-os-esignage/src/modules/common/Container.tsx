import React, { useCallback, useEffect, useState } from 'react';

import update from 'immutability-helper';

import { Card } from './Card';

import { DnDListDataSource } from '../../libs/type';

const style = {
  width: 400,
};

export interface Item {
  id: string;
  text: string;
  tag?: string | undefined;
}

export interface ContainerState {
  cards: Item[];
}

interface DnDListProps {
  dataSource?: DnDListDataSource[] | [] | null | undefined;
  onChange?: (
    dndlistDataSource: DnDListDataSource[] | [] | null | undefined,
  ) => void | null | undefined;
}

export const Container = (DnDListPropsObject: DnDListProps): JSX.Element => {
  const { dataSource, onChange } = DnDListPropsObject;
  const tempList: DnDListDataSource[] = [
    { id: '1', text: 'Item-1' },
    { id: '2', text: 'Item-2' },
    { id: '3', text: 'Item-3' },
    { id: '4', text: 'Item-4' },
    { id: '5', text: 'Item-5' },
    { id: '6', text: 'Item-6' },
    { id: '7', text: 'Item-7' },
  ];

  const [cards, setCards] = useState(dataSource || tempList);

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setCards((prevCards: Item[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    );
  }, []);

  const renderCard = useCallback(
    (card: { id: string; text: string }, index: number) => (
      <Card key={card.id} index={index} id={card.id} text={card.text} moveCard={moveCard} />
    ),
    [moveCard],
  );

  useEffect(() => {
    if (onChange !== undefined) onChange(cards);
  }, [cards, onChange]);

  return (
    <div>
      <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
    </div>
  );
};
