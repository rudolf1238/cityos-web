import gql from 'graphql-tag';

import { TemplateBasic } from './addTemplate';

export type UpdateTemplateInput = TemplateBasic;

export interface UpdateTemplateResponse {
  updateTemplate: boolean;
}
export interface UpdateTemplatePayload {
  groupId: string;
  templateId: string;
  updateTemplateInput: UpdateTemplateInput;
}

export const UPDATE_TEMPLATE = gql`
  mutation updateTemplate(
    $groupId: ID!
    $templateId: String!
    $updateTemplateInput: UpdateTemplateInput!
  ) {
    updateTemplate(
      groupId: $groupId
      templateId: $templateId
      updateTemplateInput: $updateTemplateInput
    )
  }
`;
