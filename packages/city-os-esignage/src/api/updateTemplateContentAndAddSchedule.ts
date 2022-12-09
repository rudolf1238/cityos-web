import gql from 'graphql-tag';

import { TemplateScheduleInput } from './addTemplateSchedule';
import { UpdateTemplateContentInput } from './updateTemplateContent';

export interface UpdateTemplateContentAndAddScheduleResult {
  scheduleId: string;
}

export interface UpdateTemplateContentAndAddScheduleResponse {
  updateTemplateContentAndAddSchedule: UpdateTemplateContentAndAddScheduleResult;
}

export interface UpdateTemplateContentAndAddSchedulePayload {
  groupId: string;
  token: string;
  updateTemplateContentInput: UpdateTemplateContentInput;
  templateScheduleInput: TemplateScheduleInput;
}

export const UPDATE_TEMPLATE_CONTENT_AND_ADD_SCHEDULE = gql`
  mutation updateTemplateContentAndAddSchedule(
    $groupId: ID!
    $token: String!
    $updateTemplateContentInput: UpdateTemplateContentInput!
    $templateScheduleInput: TemplateScheduleInput!
  ) {
    updateTemplateContentAndAddSchedule(
      groupId: $groupId
      token: $token
      updateTemplateContentInput: $updateTemplateContentInput
      templateScheduleInput: $templateScheduleInput
    )
  }
`;
