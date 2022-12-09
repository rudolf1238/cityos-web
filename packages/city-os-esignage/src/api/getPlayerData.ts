import gql from 'graphql-tag';

export type PlayerDataOutput = {
  id: string;
  deviceId: string;
  name: string;
  desc: string;
  type: string;
  playerName: string;
  serviceEndDate: Date;
  serviceStartDate: Date;
};

export interface GetPlayerData {
  playerDataOutput: PlayerDataOutput[];
  totalCount: number;
}

export interface GetPlayerDataResponse {
  getPlayerData: GetPlayerData;
}

export interface GetPlayerDataPayload {
  groupId: string;
  size?: number | null | undefined;
  after?: string | undefined;
  before?: string | undefined;
}

export const GET_PLAYER_DATA = gql`
  query getPlayerData($groupId: ID!, $size: Int, $after: String, $before: String) {
    getPlayerData(groupId: $groupId, size: $size, after: $after, before: $before) {
      playerDataOutput {
        id
        deviceId
        name
        desc
        type
        playerName
        serviceEndDate
        serviceStartDate
      }
      totalCount
    }
  }
`;
