import gql from 'graphql-tag';

import type { ISensorData, SensorType } from '../libs/schema';

export interface SensorValuesHistoryPayload {
  deviceId: string;
  sensorId: string;
  start: Date;
  end: Date;
  interval?: number | null;
}

interface SingleISensorData extends Omit<ISensorData<SensorType.GAUGE>, 'time'> {
  time?: number;
}

export interface SensorValuesHistoryResponse {
  sensorValuesHistory: SingleISensorData[];
}

export const SENSOR_VALUES_HISTORY = gql`
  query sensorValuesHistory(
    $deviceId: String!
    $sensorId: String!
    $start: Date!
    $end: Date!
    $interval: Int
  ) {
    sensorValuesHistory(
      deviceId: $deviceId
      sensorId: $sensorId
      start: $start
      end: $end
      interval: $interval
    ) {
      ... on GaugeSensorData {
        type
        time
        value
      }
    }
  }
`;
