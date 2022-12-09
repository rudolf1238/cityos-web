import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import React, {
  Dispatch,
  FC,
  PropsWithChildren,
  ReactChild,
  ReactNode,
  SetStateAction,
  cloneElement,
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

type CallAllType = <Args extends Array<unknown>, Fns extends Array<(...args: Args) => unknown>>(
  ...fns: [...Fns]
) => (...args: [...Args]) => void;

type ModalType = {
  children: ReactNode;
};

type ClickEventType = {
  onClick: () => void;
};

const callAll: CallAllType =
  (...fns) =>
  (...args) =>
    fns.forEach((fn) => fn?.(...args));

const ModalContext = createContext([false, () => {}] as [
  boolean,
  Dispatch<SetStateAction<boolean>>,
]);

export const Modal: FC<ModalType> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const values = useMemo(
    (): [boolean, Dispatch<SetStateAction<boolean>>] => [isOpen, setIsOpen],
    [isOpen],
  );

  return <ModalContext.Provider value={values}>{children}</ModalContext.Provider>;
};

export const ModalCloseButton: FC<{ children: ReactChild }> = ({ children }) => {
  const [, setIsOpen] = useContext(ModalContext);
  const child = children as React.ReactElement<PropsWithChildren<ClickEventType>>;

  return cloneElement(child, {
    onClick: callAll(() => setIsOpen(false), child.props.onClick),
  });
};

export const ModalOpenButton: FC<{ children: ReactChild }> = ({ children }) => {
  const [, setIsOpen] = useContext(ModalContext);
  const child = children as React.ReactElement<PropsWithChildren<ClickEventType>>;

  return cloneElement(child, {
    onClick: callAll(() => setIsOpen(true), child.props.onClick),
  });
};

export const ModalContent: FC<ModalType> = ({ children }) => {
  const [isOpen] = useContext(ModalContext);

  return (
    <Dialog open={isOpen}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};
