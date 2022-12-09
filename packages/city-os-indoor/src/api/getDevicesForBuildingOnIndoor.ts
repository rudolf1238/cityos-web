import gql from 'graphql-tag';

import { IDevice } from 'city-os-common/libs/schema';

export interface GetDevicesForBuildingOnIndoorPayload {
  groupId: string;
  deviceId: string;
  size?: number | null;
  after?: string | null;
  keyword?: string | null;
}

export type PartialNode = Pick<
  IDevice,
  'id' | 'deviceId' | 'name' | 'type' | 'groups' | 'desc' | 'attributes' | 'location' | 'imageIds'
>;

export interface GetDevicesForBuildingOnIndoorResponse {
  searchDevicesForBuilding: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    edges: {
      node: PartialNode;
    }[];
  };
}

export const GET_DEVICES_FOR_BUILDING = gql`
  query getDevicesForBuildingOnIndoor(
    $groupId: ID!
    $deviceId: ID!
    $size: Int
    $after: String
    $keyword: String = null
  ) {
    searchDevicesForBuilding(
      groupId: $groupId
      deviceId: $deviceId
      size: $size
      after: $after
      filter: { keyword: $keyword }
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          deviceId
          name
          type
          groups {
            id
            name
          }
          desc
          status
          location {
            lat
            lng
          }
          attributes {
            key
            value
          }
          imageIds
        }
      }
    }
  }
`;
