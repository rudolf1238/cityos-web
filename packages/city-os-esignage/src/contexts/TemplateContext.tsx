import React, {
  Dispatch,
  FC,
  ReactNode,
  Reducer,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { MediaType } from '../modules/common/MediaCard/MediaCard';

const TemplateContext = createContext(
  {} as { state: TemplateType; dispatch: Dispatch<IActionType> },
);
const { Provider } = TemplateContext;

export enum ActionsType {
  UPDATE_MEDIA_LIST = 'UPDATE_MEDIA_LIST',
}

type TemplateProviderType = {
  children: ReactNode;
};

type IActionType = {
  type: string;
  payload: MediaType[];
};

type TemplateType = {
  photos: {
    id: string;
    url: string;
    type: string;
  }[];
};

const initState: TemplateType = {
  photos: [],
};

const reducer: Reducer<TemplateType, IActionType> = (state, action) => {
  switch (action.type) {
    case ActionsType.UPDATE_MEDIA_LIST:
      return {
        photos: action.payload,
      };
    default:
      return {
        ...state,
      };
  }
};

const TemplateProvider: FC<TemplateProviderType> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initState);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <Provider value={value}>{children}</Provider>;
};

const useTemplateStore = () => {
  const context = useContext(TemplateContext);

  if (!context) throw new Error('need provide context!');

  return context;
};

const updateMediaList = (dispatch: Dispatch<IActionType>, payload: MediaType[]) => {
  dispatch({ type: ActionsType.UPDATE_MEDIA_LIST, payload });
};

export { TemplateProvider, useTemplateStore, updateMediaList };
