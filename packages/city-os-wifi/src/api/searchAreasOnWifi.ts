import gql from 'graphql-tag';

import { AreaFilter, IArea } from '../libs/schema';

export type PartialAreaNode = Pick<IArea, 'id' | 'name' | 'serviceStartDate' | 'serviceEndDate'>;

export interface SearchAreasPayload {
  groupId: string;
  companyId: string;
  filter?: AreaFilter;
  currentPage?: number;
  pageCount?: number;
}

export interface SearchAreasResponse {
  getAreaList: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    areas: {
      node: PartialAreaNode;
    }[];
  };
}

export const SEARCH_AREAS_ON_WIFI = gql`
  query searchAreasOnWifi(
    $groupId: ID!
    $companyId: String
    $filter: AreaFilter
    $currentPage: Int
    $pageCount: Int
  ) {
    getAreaList(
      groupId: $groupId
      companyId: $companyId
      filter: $filter
      currentPage: $currentPage
      pageCount: $pageCount
    ) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      areas {
        node {
          id
          name
          serviceStartDate
          serviceEndDate
        }
      }
    }
  }
`;
