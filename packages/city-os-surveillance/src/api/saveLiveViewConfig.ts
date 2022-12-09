import gql from 'graphql-tag';

import type { LiveViewConfig, SplitMode } from '../libs/type';

interface LiveViewConfigInput extends Omit<Partial<LiveViewConfig>, 'splitMode'> {
  splitMode?: SplitMode;
}

export interface SaveLiveViewConfigPayload {
  input: LiveViewConfigInput;
}

export interface SaveLiveViewConfigResponse {
  saveLiveViewConfig: LiveViewConfig | null;
}

export const SAVE_LIVE_VIEW_CONFIG = gql`
  mutation saveLiveViewConfig($input: LiveViewConfigInput!) {
    saveLiveViewConfig(input: $input) {
      devices {
        deviceId
        fixedIndex
      }
      splitMode
      autoplay
      autoplayInSeconds
    }
  }
`;
