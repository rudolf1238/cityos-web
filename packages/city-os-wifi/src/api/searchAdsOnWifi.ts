import gql from 'graphql-tag';

import { AdFilter, IAd } from '../libs/schema';

export type PartialAdNode = Pick<
  IAd,
  | 'id'
  | 'name'
  | 'company_name'
  | 'company_vat'
  | 'type'
  | 'pricing_type'
  | 'image'
  | 'youtube_video_id'
  | 'min_view_time'
  | 'weight'
  | 'click_qty'
  | 'placement_count'
  | 'click_count'
  | 'cost_per_click'
  | 'costs'
  | 'daily_click_qty'
  | 'link_type'
  | 'url'
  | 'copywriting'
  | 'comment'
  | 'start_datetime'
  | 'end_datetime'
  | 'start_timeslot'
  | 'end_timeslot'
  | 'area_list'
>;

export interface SearchAdsPayload {
  groupId: string;
  companyId: string;
  filter?: AdFilter;
  currentPage?: number;
  pageCount?: number;
}

export interface SearchAdsResponse {
  getAdList: {
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
    ads: {
      node: PartialAdNode;
    }[];
  };
}

export const SEARCH_ADS_ON_WIFI = gql`
  query searchAdsOnWifi(
    $groupId: ID!
    $companyId: String
    $filter: AdFilter
    $currentPage: Int
    $pageCount: Int
  ) {
    getAdList(
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
      ads {
        node {
          id
          name
          company_name
          type
          image
          youtube_video_id
        }
      }
    }
  }
`;
