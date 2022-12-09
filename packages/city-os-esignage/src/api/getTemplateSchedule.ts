import gql from 'graphql-tag';

export type TemplateScheduleOutput = {
  templateId: string;
  scheduleId: string;
  scheduleName: string;
  playStartDate: string;
  playEndDate: string | null;
  playStartTime: string;
  playEndTime: string | null;
  loopMode: string;
  dailyFrequency: number;
  weeklyFrequency: string[];
  monthlyFrequency_Month: string[];
  monthlyFrequency_Day: number[];
  audioSetting: number;
  downloadDirectly: boolean;
  scheduledDownloadTime: Date;
};

export interface GetTemplateSchedule {
  templateScheduleOutput: TemplateScheduleOutput[];
  totalCount: number;
}

export interface GetTemplateScheduleResponse {
  getTemplateSchedule: GetTemplateSchedule;
}

export interface GetTemplateSchedulePayload {
  groupId: string;
  templateId: string;
  page?: number | null;
  pageSize?: number | null;
  filter?: undefined | null | unknown;
}

export const GET_TEMPLATEATE_SCHEDULE = gql`
  query getTemplateSchedule(
    $groupId: ID!
    $templateId: String!
    $page: Int
    $pageSize: Int
    $filter: Filter
  ) {
    getTemplateSchedule(
      groupId: $groupId
      templateId: $templateId
      page: $page
      pageSize: $pageSize
      filter: $filter
    ) {
      templateScheduleOutput {
        templateId
        scheduleId
        scheduleName
        playStartDate
        playEndDate
        playStartTime
        playEndTime
        loopMode
        dailyFrequency
        weeklyFrequency
        monthlyFrequency_Month
        monthlyFrequency_Day
        audioSetting
        downloadDirectly
        scheduledDownloadTime
      }
      totalCount
    }
  }
`;
