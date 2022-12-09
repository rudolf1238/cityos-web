import gql from 'graphql-tag';

export interface DeleteAreaPayload {
  groupId: string;
  companyId: string;
  areaId: string;
}

export interface DeleteAreaResponse {
  deleteArea: string[];
}

// delete_company just remove company_id in groups collection
export const DELETE_AREA = gql`
  mutation deleteArea($groupId: ID!, $companyId: String!, $areaId: String!) {
    deleteArea(groupId: $groupId, companyId: $companyId, areaId: $areaId)
  }
`;
