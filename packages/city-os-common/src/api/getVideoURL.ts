import gql from 'graphql-tag';

import type { GetVideoURLPayload } from '../libs/schema';

export interface GetVideoURLResponse {
  getVideoURL: GetVideoURLPayload;
}

export interface GetVideoURLVars {
  deviceIds: string[];
}

export const GET_VIDEO_URL = gql`
  query getVideoURL($deviceIds: [String!]!) {
    getVideoURL(deviceIds: $deviceIds) {
      token
      urlToken
      expiredAt
      streamList {
        deviceId
        camId
        url
      }
    }
  }
`;
