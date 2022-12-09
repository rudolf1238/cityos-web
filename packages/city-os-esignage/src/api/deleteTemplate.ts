import gql from 'graphql-tag';

export interface DeleteTemplateResponse {
  deleteTemplate: boolean;
}

export interface DeleteTemplatePayload {
  groupId: string;
  templateId: string;
}
export const DELETE_TEMPLATE = gql`
  mutation deleteTemplate($groupId: ID!, $templateId: String!) {
    deleteTemplate(groupId: $groupId, templateId: $templateId)
  }
`;
