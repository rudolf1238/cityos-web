import gql from 'graphql-tag';

interface MediaPool {
  id: string;
  mediaId: string;
  userId: string;
  templateId: string;
}

export interface GetMediaPool {
  getMediaPool: { mediaPoolOutput: MediaPool[] };
}

export const GET_MEDIA_POOL = gql`
  query getMediaPool($groupId: ID!, $page: Int, $pageSize: Int) {
    getMediaPool(groupId: $groupId, page: $page, pageSize: $pageSize) {
      mediaPoolOutput {
        id
        mediaId
        userId
        templateId
      }
    }
  }
`;
