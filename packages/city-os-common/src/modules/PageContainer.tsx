import React, { ReactNode, VoidFunctionComponent } from 'react';

import Container from '@material-ui/core/Container';

import PageWithFooter from './PageWithFooter';

interface PageContainerProps {
  className?: string;
  children: NonNullable<ReactNode>;
}

const PageContainer: VoidFunctionComponent<PageContainerProps> = ({
  className,
  children,
}: PageContainerProps) => (
  <PageWithFooter>
    <Container className={className}>{children}</Container>
  </PageWithFooter>
);

export default PageContainer;
