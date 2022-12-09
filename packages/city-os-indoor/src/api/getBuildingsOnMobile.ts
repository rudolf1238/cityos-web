import gql from 'graphql-tag';

import { Building } from '../libs/type';

export interface GetBuildingsOnMobilePayload {
  groupId: string;
}

export interface BuildingEdge {
  node: Pick<Building, 'deviceId' | 'name' | 'desc' | 'imageIds' | 'location'>;
  deviceCount: number;
}

export interface GetBuildings {
  edges: BuildingEdge[];
}

export interface GetBuildingsOnMobileResponse {
  getBuildings: GetBuildings;
}

export const GET_BUILDINGS_ON_MOBILE = gql`
  query getBuildingsOnMobile($groupId: ID!) {
    getBuildings(groupId: $groupId) {
      edges {
        deviceCount
        node {
          deviceId
          name
          desc
          imageIds
          location {
            lat
            lng
          }
        }
      }
    }
  }
`;
