import { fade, makeStyles } from '@material-ui/core/styles';
import { useRouter } from 'next/router';
import React, {
  FunctionComponent,
  PropsWithChildren,
  ProviderProps,
  ReactNode,
  VoidFunctionComponent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import type { TreeItemProps } from '@material-ui/lab/TreeItem';
import type { TreeViewProps } from '@material-ui/lab/TreeView';

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  treeItem: {
    flexShrink: 0,
    transitionDuration: '0.5s',
    transitionProperty: 'all',
    width: 64,
    overflow: 'hidden',
    whiteSpace: 'nowrap',

    '& > $content:hover': {
      backgroundColor: fade(theme.palette.primary.main, 0.2),
    },

    '& > $content$active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },

    '& > $content $label': {
      backgroundColor: 'transparent !important',
    },

    '& > $content$active:hover ': {
      backgroundColor: theme.palette.primary.dark,
    },
  },

  content: {
    padding: theme.spacing(2.5),
    color: theme.palette.menu.info,
  },

  iconContainer: {
    position: 'absolute',
    right: 0,
    zIndex: 1,
  },

  group: {
    margin: 0,

    '& $treeItem': {
      display: 'none',
    },

    /* stylelint-disable-next-line no-descending-specificity, NOTE: Prevent from selector order contradiction between 'group' and 'treeItem' */
    '& $treeItem > $content$active': {
      backgroundColor: fade(theme.palette.primary.main, 0.2),
      color: fade(theme.palette.primary.main, 0.9),
    },

    '& $treeItem > $content$active:hover': {
      backgroundColor: fade(theme.palette.primary.main, 0.3),
    },
  },

  expanded: {
    '& $treeItem': {
      width: 240,
    },

    '& $group $treeItem': {
      display: 'list-item',
    },
  },

  /* stylelint-disable-next-line block-no-empty, NOTE: Keep class access to child combinator */
  active: {},

  label: {
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },

  icon: {
    display: 'flex',
    flexBasis: 24,
    flexShrink: 0,
  },

  text: {
    paddingLeft: theme.spacing(2.5),
  },
}));

interface NestedListContextValue {
  handleToggle: (nodeId: string) => void;
}

const NestedListContext = createContext<NestedListContextValue>({
  handleToggle: () => {},
});

const NestedListProvider: FunctionComponent<ProviderProps<NestedListContextValue>> = ({
  value,
  children,
}: ProviderProps<NestedListContextValue>) => {
  return <NestedListContext.Provider value={value}>{children}</NestedListContext.Provider>;
};

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Omit<T, Keys> &
  {
    [K in Keys]: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, never>>;
  }[Keys];

export interface BaseMenuItemProps {
  nodeId: string;
  labelIcon?: ReactNode;
  labelText: string;
  link?: string;
  subItems?: NestedListItemProps[];
}

type NestedListItemProps = RequireOnlyOne<BaseMenuItemProps, 'link' | 'subItems'> &
  Omit<TreeItemProps, 'nodeId'>;

const NestedListItem: VoidFunctionComponent<NestedListItemProps> = ({
  nodeId,
  labelIcon: LabelIcon,
  labelText,
  link,
  subItems,
  ...props
}: NestedListItemProps) => {
  const classes = useStyles();
  const { handleToggle: initialHandleToggle } = useContext(NestedListContext);
  const router = useRouter();

  const handleSelect = useCallback(() => {
    if (link) {
      void router.push(link);
    } else if (subItems) {
      initialHandleToggle(nodeId);
    }
  }, [link, subItems, router, initialHandleToggle, nodeId]);

  const subLinks = subItems?.map((item) => item.link);

  return (
    <TreeItem
      nodeId={nodeId}
      onClick={handleSelect}
      label={
        <>
          <div className={classes.icon}>{LabelIcon}</div>
          <Typography variant="body2" className={classes.text}>
            {labelText}
          </Typography>
        </>
      }
      classes={{
        root: classes.treeItem,
        iconContainer: classes.iconContainer,
        content: clsx(classes.content, {
          [classes.active]:
            (link && router.asPath.startsWith(link)) ||
            (subLinks && subLinks.some((l) => l && router.asPath.startsWith(l))),
        }),
        label: classes.label,
        group: classes.group,
      }}
      {...props}
    >
      {subItems?.map((itemProps) => (
        <NestedListItem key={itemProps.nodeId} {...itemProps} />
      ))}
    </TreeItem>
  );
};

type NestedListProps = TreeViewProps & {
  isExpanded: boolean;
  onToggle: (isExpanded: boolean) => void;
};

const NestedList: FunctionComponent<NestedListProps> = ({
  isExpanded: initialIsExpanded,
  onToggle,
  children,
  ...props
}: PropsWithChildren<NestedListProps>) => {
  const classes = useStyles();
  const [expandedList, setExpandedList] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedList((prev) => {
      const nodeIdIdx = prev.findIndex((id) => id === nodeId);
      const newExpendedList = [...prev];
      if (nodeIdIdx !== -1) {
        newExpendedList.splice(nodeIdIdx, 1);
      } else {
        newExpendedList.push(nodeId);
      }
      return newExpendedList;
    });
  }, []);

  const contextValue = useMemo<NestedListContextValue>(
    () => ({
      handleToggle,
    }),
    [handleToggle],
  );

  useEffect(() => {
    setIsExpanded(expandedList.length > 0);
  }, [expandedList]);

  useEffect(() => {
    onToggle(isExpanded);
  }, [isExpanded, onToggle]);

  useEffect(() => {
    setIsExpanded(initialIsExpanded);
  }, [initialIsExpanded]);

  return (
    <NestedListProvider value={contextValue}>
      <TreeView
        defaultCollapseIcon={<KeyboardArrowDownIcon />}
        defaultExpandIcon={<KeyboardArrowRightIcon />}
        className={isExpanded ? classes.expanded : undefined}
        expanded={expandedList}
        disableSelection
        {...props}
      >
        {children}
      </TreeView>
    </NestedListProvider>
  );
};

export { NestedList, NestedListItem };
