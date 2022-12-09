import gql from 'graphql-tag';

import { TemplateScheduleInput } from './addTemplateSchedule';

export interface UpdateTemplateScheduleResponse {
  updateTemplateSchedule: boolean;
}

export interface UpdateTemplateSchedulePayload {
  groupId: string;
  token: string;
  templateScheduleInput: TemplateScheduleInput;
  templateScheduleId: string;
}

export const UPDATE_TEMPLATE_SCHEDULE = gql`
  mutation updateTemplateSchedule(
    $groupId: ID!
    $token: String!
    $templateScheduleInput: TemplateScheduleInput!
    $templateScheduleId: String!
  ) {
    updateTemplateSchedule(
      groupId: $groupId
      token: $token
      templateScheduleInput: $templateScheduleInput
      templateScheduleId: $templateScheduleId
    )
  }
`;
