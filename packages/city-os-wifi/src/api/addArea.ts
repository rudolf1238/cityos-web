import gql from 'graphql-tag';

export interface AddAreaPayload {
  groupId: string;
  companyId: string;
  areaName: string;
  serviceStartDate: string;
  serviceEndDate?: string;
}
export interface AddAreaResponse {
  addAreaResult: string;
}

export const ADD_AREA = gql`
  mutation addArea(
    $groupId: ID!
    $companyId: String!
    $areaName: String!
    $serviceStartDate: String!
    $serviceEndDate: String
  ) {
    addArea(
      groupId: $groupId
      companyId: $companyId
      areaName: $areaName
      serviceStartDate: $serviceStartDate
      serviceEndDate: $serviceEndDate
    )
  }
`;
