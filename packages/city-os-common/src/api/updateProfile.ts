import gql from 'graphql-tag';

import type { Language, Theme, User } from '../libs/schema';

interface UpdateProfileInput {
  name?: string | null;
  phone?: string | null;
  language?: Language | null;
  theme?: Theme | null;
  photo?: string | null;
}

export interface UpdateProfilePayload {
  updateProfileInput: UpdateProfileInput;
}

export interface UpdateProfileResponse {
  updateProfile: User;
}

export const UPDATE_PROFILE = gql`
  mutation updateProfile($updateProfileInput: UpdateProfileInput!) {
    updateProfile(updateProfileInput: $updateProfileInput) {
      email
      name
      phone
      status
      language
      theme
      photo
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
  }
`;
