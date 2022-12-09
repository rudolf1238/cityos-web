import gql from 'graphql-tag';

export interface DeleteAdPayload {
  groupId: string;
  companyId: string;
  adId: string;
}

export interface DeleteAdResponse {
  deleteAd: string[];
}

// delete_company just remove company_id in groups collection
export const DELETE_AD = gql`
  mutation deleteAd($groupId: ID!, $companyId: String!, $adId: String!) {
    deleteAd(groupId: $groupId, companyId: $companyId, id: $adId)
  }
`;
