import { SortOrder } from 'city-os-common/libs/schema';
import gql from 'graphql-tag';

export type CityOutput = {
  id: string;
  cityName: string;
  region: string;
  status: number;
};

export interface GetCity {
  cityOutput: CityOutput[];
  totalCount: number;
}

export interface GetCityResponse {
  getCity: GetCity;
}

export interface GetCityPayload {
  groupId: string;
  page?: number | null | undefined;
  pageSize?: number | null | undefined;
  filter?: undefined | null | unknown;
}

export interface CityFilter {
  keyword: string;
  sortField: CityField;
  sortOrder: SortOrder;
}
enum CityField {
  ID = 'ID',
  CITYNAME = 'CITYNAME',
  NAME = 'NAME',
}

export const GET_CITY = gql`
  query getCity($groupId: ID!, $page: Int, $pageSize: Int, $filter: CityFilter) {
    getCity(groupId: $groupId, page: $page, pageSize: $pageSize, filter: $filter) {
      cityOutput {
        id
        cityName
        region
        status
      }
      totalCount
    }
  }
`;
