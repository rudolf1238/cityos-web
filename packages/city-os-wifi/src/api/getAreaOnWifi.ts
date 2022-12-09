import gql from 'graphql-tag';

import { PartialAreaNode } from './searchAreasOnWifi';

export interface GetAreaPayload {
  groupId?: string;
  companyId: string;
  areaId: string;
}

export interface GetAreaResponse {
  getArea: {
    node: PartialAreaNode;
  };
}

export const GET_AREA_ON_WIFI = gql`
  query getAreaOnWifi($groupId: ID!, $companyId: String, $areaId: String) {
    getArea(groupId: $groupId, companyId: $companyId, areaId: $areaId) {
      node {
        id
        name
        serviceStartDate
        serviceEndDate
      }
    }
  }
`;
