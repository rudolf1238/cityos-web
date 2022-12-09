import React, { ForwardRefRenderFunction, PropsWithChildren, Ref, forwardRef } from 'react';
import type { LinkProps as MuiLinkProps } from '@material-ui/core/Link';
import type { LinkProps as NextLinkProps } from 'next/link';

import MuiLink from '@material-ui/core/Link';
import NextLink from 'next/link';

type LinkProps = Omit<MuiLinkProps, 'href' | 'classes'> &
  Pick<NextLinkProps, 'href' | 'as' | 'prefetch'>;

const Link: ForwardRefRenderFunction<HTMLAnchorElement, LinkProps> = (
  { href, as, prefetch, ...props }: PropsWithChildren<LinkProps>,
  ref: Ref<HTMLAnchorElement>,
) => (
  <NextLink href={href} as={as} prefetch={prefetch} passHref>
    <MuiLink ref={ref} {...props} />
  </NextLink>
);

export default forwardRef<HTMLAnchorElement, LinkProps>(Link);
