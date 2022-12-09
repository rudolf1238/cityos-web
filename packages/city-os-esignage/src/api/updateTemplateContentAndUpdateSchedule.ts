import gql from 'graphql-tag';

import { TemplateScheduleInput } from './addTemplateSchedule';
import { UpdateTemplateContentInput } from './updateTemplateContent';

export interface UpdateTemplateContentAndUpdateScheduleResponse {
  updateTemplateContentAndUpdateSchedule: boolean;
}

export interface UpdateTemplateContentAndUpdateSchedulePayload {
  groupId: string;
  token: string;
  templateScheduleId: string;
  updateTemplateContentInput: UpdateTemplateContentInput;
  templateScheduleInput: TemplateScheduleInput;
}

export const UPDATE_TEMPLATE_CONTENT_AND_UPDATE_SCHEDULE = gql`
  mutation updateTemplateContentAndUpdateSchedule(
    $groupId: ID!
    $token: String!
    $templateScheduleId: String!
    $updateTemplateContentInput: UpdateTemplateContentInput!
    $templateScheduleInput: TemplateScheduleInput!
  ) {
    updateTemplateContentAndUpdateSchedule(
      groupId: $groupId
      token: $token
      templateScheduleId: $templateScheduleId
      updateTemplateContentInput: $updateTemplateContentInput
      templateScheduleInput: $templateScheduleInput
    )
  }
`;
