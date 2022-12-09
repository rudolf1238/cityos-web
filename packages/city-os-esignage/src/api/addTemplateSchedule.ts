import gql from 'graphql-tag';

export interface TemplateScheduleInput {
  templateId: string;
  scheduleName: string;
  playStartDate: string; // 日期時間: 2022/09/16   (UTC)
  playEndDate?: string | undefined; // 日期時間: 2022/09/16   (UTC)
  playStartTime: string; // 僅時間: 00:00:00  (localtime)
  playEndTime?: string | undefined; // 僅時間: 23:59:59 (localtime)
  loopMode: string;
  dailyFrequency?: number | null;
  weeklyFrequency?: string[] | null;
  monthlyFrequency_Month?: string[] | null;
  monthlyFrequency_Day?: number[] | null;
  audioSetting: number;
  downloadDirectly: boolean;
  scheduledDownloadTime: string; // 日期時間: 2022/09/16 10:10:10 (UTC)
  players: string[] | null;
}

export interface AddTemplateScheduleResponse {
  addTemplateSchedule: boolean;
}

export interface AddTemplateSchedulePayload {
  groupId: string;
  token: string;
  templateScheduleInput: TemplateScheduleInput;
}

export const ADD_TEMPLATE_SCHEDULE = gql`
  mutation addTemplateSchedule(
    $groupId: ID!
    $token: String!
    $templateScheduleInput: TemplateScheduleInput!
  ) {
    addTemplateSchedule(
      groupId: $groupId
      token: $token
      templateScheduleInput: $templateScheduleInput
    )
  }
`;
