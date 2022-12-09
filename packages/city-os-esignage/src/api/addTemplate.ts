import gql from 'graphql-tag';

export interface TemplateBasic {
  name: string;
  description: string;
  templateTypeId: string;
  backgroundColor: string;
  group: string;
}

export interface TemplateInput extends TemplateBasic {
  templateContent: TemplateContent[];
}
export interface TemplateContent {
  contentTypeId: string;
  contentName: string;
  tag: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rectId: string;
  contentDeatail: ContentDetail;
}
export interface ContentDetail {
  weather?: Weather | undefined;
  media?: Media[] | undefined;
  webpage?: Webpage[] | undefined;
  ipCam?: IpCam[] | undefined;
}
export interface Weather {
  weatherStyleId: string;
  temperatureUnit: string;
  windSpeedUnit: string;
  languageId: string;
  backgroundColor: string;
  durations: number;
  citys: string[];
}
export interface Media {
  mediaId: string;
  imagePlayDurations: number;
}
export interface Webpage {
  webUrl: string;
  playTime: number;
}
export interface IpCam {
  camName: string;
  rtspUrl: string;
  durations: number;
}
export interface AddTemplateContentResponse {
  addTemplate: string;
}
export interface AddTemplateContentPayload {
  groupId: string;
  templateInput: TemplateInput;
}

export const ADD_TEMPLATE = gql`
  mutation addTemplate($groupId: ID!, $templateInput: TemplateInput!) {
    addTemplate(groupId: $groupId, templateInput: $templateInput)
  }
`;
