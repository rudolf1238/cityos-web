import gql from 'graphql-tag';

import { PartialAdNode } from './searchAdsOnWifi';

export interface GetAdPayload {
  groupId?: string;
  companyId: string;
  id: string;
}

export interface GetAdResponse {
  getAd: {
    node: PartialAdNode;
  };
}

export const GET_AD_ON_WIFI = gql`
  query getAdOnWifi($groupId: ID!, $companyId: String!, $id: String!) {
    getAd(groupId: $groupId, companyId: $companyId, id: $id) {
      node {
        id
        name
        company_name
        company_vat
        type
        pricing_type
        image
        youtube_video_id
        min_view_time
        weight
        click_qty
        placement_count
        click_count
        cost_per_click
        costs
        daily_click_qty
        link_type
        url
        copywriting
        comment
        start_datetime
        end_datetime
        start_timeslot
        end_timeslot
        area_list
      }
    }
  }
`;
