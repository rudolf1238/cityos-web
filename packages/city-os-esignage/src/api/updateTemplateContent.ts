import gql from 'graphql-tag';

import { TemplateContent } from './addTemplate';

export interface UpdateTemplateContent extends TemplateContent {
  contentId: string;
}

export interface UpdateTemplateContentInput {
  updateTemplateContent: UpdateTemplateContent[];
}

export interface UpdateTemplateContentResponse {
  updateTemplateContent: boolean;
}
export interface UpdateTemplateContentPayload {
  groupId: string;
  templateId: string;
  updateTemplateContentInput: UpdateTemplateContentInput;
}

export const UPDATE_TEMPLATE_CONTENT = gql`
  mutation updateTemplateContent(
    $groupId: ID!
    $templateId: String!
    $updateTemplateContentInput: UpdateTemplateContentInput!
  ) {
    updateTemplateContent(
      groupId: $groupId
      templateId: $templateId
      updateTemplateContentInput: $updateTemplateContentInput
    )
  }
`;
