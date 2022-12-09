import gql from 'graphql-tag';

export interface EditAreaPayload {
  groupId: string;
  companyId: string;
  areaId: string;
  areaName: string;
  serviceStartDate: string;
  serviceEndDate?: string;
}
export interface EditAreaResponse {
  editAreaResult: string;
}

export const EDIT_AREA = gql`
  mutation editArea(
    $groupId: ID!
    $companyId: String!
    $areaId: String!
    $areaName: String!
    $serviceStartDate: String!
    $serviceEndDate: String
  ) {
    editArea(
      groupId: $groupId
      companyId: $companyId
      areaId: $areaId
      areaName: $areaName
      serviceStartDate: $serviceStartDate
      serviceEndDate: $serviceEndDate
    )
  }
`;
