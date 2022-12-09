import gql from 'graphql-tag';

export type DivsionOutput = {
  id: string;
  groupName: string;
};

export interface GetDivision {
  divisionOutput: DivsionOutput[];
  totalCount: number;
}

export interface GetDivisionResponse {
  getDivision: GetDivision;
}

export interface GetDivisionPayload {
  groupId: string;
  filter?: undefined | null | unknown;
}

export const GET_DIVISION = gql`
  query getDivision($groupId: ID!, $filter: Filter) {
    getDivision(groupId: $groupId, filter: $filter) {
      divisionOutput {
        id
        groupName
      }
      totalCount
    }
  }
`;
