import React, {
  Dispatch,
  FunctionComponent,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import { downloadInitialState, downloadReducer } from './download';
import { exitDialogInitialState, exitDialogReducer } from './exitDialog';
import { snackbarInitialState, snackbarReducer } from './snackbar';
import { userInitialState, userReducer } from './user';
import { userProfileInitialState, userProfileReducer } from './userProfile';
import type { DownloadAction, DownloadState } from './download';
import type { ExitDialogAction, ExitDialogState } from './exitDialog';
import type { SnackbarAction, SnackbarState } from './snackbar';
import type { UserAction, UserState } from './user';
import type { UserProfileAction, UserProfileState } from './userProfile';

type RootAction =
  | UserAction
  | SnackbarAction
  | ExitDialogAction
  | UserProfileAction
  | DownloadAction;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function combineDispatches(...dispatches: Dispatch<any>[]): Dispatch<RootAction> {
  return (value) => {
    dispatches.forEach((dispatch) => {
      dispatch(value);
    });
  };
}

interface RootState {
  user: UserState;
  snackbar: SnackbarState;
  exitDialog: ExitDialogState;
  userProfile: UserProfileState;
  download: DownloadState;
  dispatch: Dispatch<RootAction>;
}

export const store: RootState = {
  user: userInitialState,
  snackbar: snackbarInitialState,
  exitDialog: exitDialogInitialState,
  userProfile: userProfileInitialState,
  download: downloadInitialState,
  dispatch: () => {
    throw new Error('dispatch before initialize');
  },
};

export const StoreContext = createContext<RootState>(store);

type StoreProviderProps = Record<never, never>;

export const StoreProvider: FunctionComponent<StoreProviderProps> = ({
  children,
}: PropsWithChildren<StoreProviderProps>) => {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);
  const [snackbarState, snackbarDispatch] = useReducer(snackbarReducer, snackbarInitialState);
  const [exitDialogState, exitDialogDispatch] = useReducer(
    exitDialogReducer,
    exitDialogInitialState,
  );
  const [userProfileState, userProfileDispatch] = useReducer(
    userProfileReducer,
    userProfileInitialState,
  );
  const [downloadState, downloadDispatch] = useReducer(downloadReducer, downloadInitialState);

  store.user = userState;
  store.snackbar = snackbarState;
  store.exitDialog = exitDialogState;
  store.userProfile = userProfileState;
  store.download = downloadState;
  store.dispatch = useMemo(
    () =>
      combineDispatches(
        userDispatch,
        snackbarDispatch,
        exitDialogDispatch,
        userProfileDispatch,
        downloadDispatch,
      ),
    [],
  );

  // eslint-disable-next-line react/jsx-no-constructed-context-values
  return <StoreContext.Provider value={{ ...store }}>{children}</StoreContext.Provider>;
};

export function useStore(): RootState {
  return useContext(StoreContext);
}
