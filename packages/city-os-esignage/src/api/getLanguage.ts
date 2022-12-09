import gql from 'graphql-tag';

export type LanguageOutput = {
  id: string;
  languageCode: string;
  languageName: string;
  status: number;
};

export interface GetLanguage {
  languageOutput: LanguageOutput[];
  totalCount: number;
}

export interface GetLanguageResponse {
  getLanguage: GetLanguage;
}

export interface GetLanguagePayload {
  groupId: string;
  page?: number | null | undefined;
  pageSize?: number | null | undefined;
  filter?: undefined | null | unknown;
}

export const GET_LANGUAGE = gql`
  query getLanguage($groupId: ID!, $page: Int, $pageSize: Int, $filter: Filter) {
    getLanguage(groupId: $groupId, page: $page, pageSize: $pageSize, filter: $filter) {
      languageOutput {
        id
        languageCode
        languageName
        status
      }
      totalCount
    }
  }
`;
