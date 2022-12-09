import type { CommonResources } from './src/libs/i18n';

declare module 'react-i18next' {
  type DefaultResources = CommonResources;
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Resources extends CommonResources {}
}
