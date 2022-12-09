import gql from 'graphql-tag';

export type EsignageTemplateTypeOutput = {
  id: string;
  typeName: string;
  resolution?: string | null;
  description?: string | null;
  templateImagePath_Light: string;
  templateImagePath_Dark: string;
  status: number;
};

export interface GetTemplateType {
  esignageTemplateTypeOutput: EsignageTemplateTypeOutput[];
  totalCount: number;
}

export interface GetTemplateTypeResponse {
  getTemplateType: GetTemplateType;
}

export interface GetTemplateTypePayload {
  groupId: string;
  page?: number | null;
  pageSize?: number | null;
  filter?: undefined | null | unknown;
}

export const GET_TEMPLATEATE_TYPE = gql`
  query getTemplateType($groupId: ID!, $page: Int, $pageSize: Int) {
    getTemplateType(groupId: $groupId, page: $page, pageSize: $pageSize) {
      esignageTemplateTypeOutput {
        id
        typeName
        resolution
        description
        templateImagePath_Light
        templateImagePath_Dark
        status
      }
      totalCount
    }
  }
`;
