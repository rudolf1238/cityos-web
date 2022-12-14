import gql from 'graphql-tag';

import { User } from 'city-os-common/libs/schema';

export interface GetUserProfileResponse {
  userProfile: User;
}

export const USER_PROFILE = gql`
  fragment UserProfile on User {
    email
    name
    phone
    photo
    isLINEConnected
    status
    language
    theme
    groups {
      group {
        id
        name
        projectKey
        subGroups
      }
      permission {
        rules {
          action
          subject
        }
      }
    }
  }
`;

export const GET_USER_PROFILE = gql`
  ${USER_PROFILE}
  query getUserProfile {
    userProfile {
      ...UserProfile
    }
  }
`;
