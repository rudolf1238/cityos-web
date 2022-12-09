import gql from 'graphql-tag';

export interface TPContentDetail {
  weather: WeatherDeatail;
  media: MediaDetail[];
  webpage: WebpageDetail[];
  cam: IpCamDetail[];
}
export interface MediaDetail {
  id: string;
  mediaId: string;
  imagePlayDurations: number;
  originalname: string;
  size: number;
}

export interface WeatherDeatail {
  id: string;
  weatherStyleId: string;
  temperatureUnit: string;
  windSpeedUnit: string;
  languageId: string;
  backgroundColor: string;
  durations: number;
  citys: string[];
}
export interface WebpageDetail {
  id: string;
  webUrl: string;
  playTime: number;
}
export interface IpCamDetail {
  id: string;
  camName: string;
  rtspUrl: string;
  durations: number;
}

export interface TemplateContent {
  contentId: string;
  templateId: string;
  contentTypeId: string;
  contentName: string;
  tag: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rectId: string;
  templateContentDetail: TPContentDetail;
}

export interface GetTemplateContent {
  id: string;
  name: string;
  templateTypeId: string;
  description: string;
  group: string;
  templateContent: TemplateContent[];
}

export interface GetTemplateContentResponse {
  getTemplateContent: GetTemplateContent;
}

export interface GetTemplateContentPayload {
  groupId: string;
  templateId: string;
}

export const GET_TEMPLATEATE_CONTENT = gql`
  query getTemplateContent($groupId: ID!, $templateId: ID!) {
    getTemplateContent(groupId: $groupId, templateId: $templateId) {
      id
      name
      templateTypeId
      description
      group
      templateContent {
        contentId
        templateId
        contentTypeId
        contentName
        tag
        x
        y
        width
        height
        rectId
        templateContentDetail {
          weather {
            id
            weatherStyleId
            temperatureUnit
            windSpeedUnit
            languageId
            backgroundColor
            durations
            citys
          }
          media {
            id
            mediaId
            imagePlayDurations
            originalname
            size
          }
          webpage {
            id
            webUrl
            playTime
          }
          cam {
            id
            camName
            rtspUrl
            durations
          }
        }
      }
    }
  }
`;
