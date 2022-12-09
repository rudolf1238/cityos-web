import gql from 'graphql-tag';

import { EditWifiAdInput } from '../libs/schema';

export interface EditAdPayload {
  groupId: string;
  companyId: string;
  wifiAdInput: EditWifiAdInput;
}
export interface EditAdResponse {
  editAdResult: string;
}

export const EDIT_AD = gql`
  mutation editAd($groupId: ID!, $companyId: String!, $wifiAdInput: EditWifiAdInput!) {
    editAd(groupId: $groupId, companyId: $companyId, wifiAdInput: $wifiAdInput)
  }
`;
