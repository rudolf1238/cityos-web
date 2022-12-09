import gql from 'graphql-tag';

import { AddWifiAdInput } from '../libs/schema';

export interface AddAdPayload {
  groupId: string;
  companyId: string;
  wifiAdInput: AddWifiAdInput;
}
export interface AddAdResponse {
  addAdResult: string;
}

export const ADD_AD = gql`
  mutation addAd($groupId: ID!, $companyId: String!, $wifiAdInput: AddWifiAdInput!) {
    addAd(groupId: $groupId, companyId: $companyId, wifiAdInput: $wifiAdInput)
  }
`;
