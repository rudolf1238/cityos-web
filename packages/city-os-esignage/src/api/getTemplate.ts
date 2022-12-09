import gql from 'graphql-tag';

export type TemplateOutput = {
  id: string;
  name: string;
  description?: string | null;
  backgroundColor: string;
  group: string;
  groupName: string;
  templateTypeId: string;
  typeName: string;
  typeResolution: string;
};

export interface GetTemplate {
  templateOutput: TemplateOutput[];
  totalCount: number;
}

export interface GetTemplateResponse {
  getTemplate: GetTemplate;
}

export interface GetTemplatePayload {
  groupId: string;
  page?: number | null;
  pageSize?: number | null;
  filter?: undefined | null | unknown;
}

export const GET_TEMPLATEATE = gql`
  query getTemplate($groupId: ID!, $page: Int, $pageSize: Int) {
    getTemplate(groupId: $groupId, page: $page, pageSize: $pageSize) {
      templateOutput {
        id
        name
        description
        backgroundColor
        group
        groupName
        templateTypeId
        typeName
        typeResolution
      }
      totalCount
    }
  }
`;
