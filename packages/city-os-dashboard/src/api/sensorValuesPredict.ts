import gql from 'graphql-tag';

import { ISensorData, SensorType } from 'city-os-common/src/libs/schema';
import { ExtremeOperation } from '../libs/type';

export interface SensorValuesPredictPayload {
  deviceId: string;
  sensorId: string;
  seasonalityPeriod: number | null;
  mode: ExtremeOperation;
  start: Date;
  end: Date;
  interval?: number | null;
  pastInterval?: number | null;
  lowerBound?: number | null;
  upperBound?: number | null;
}

export interface SingleISensorData extends Omit<ISensorData<SensorType.GAUGE>, 'time'> {
  time?: number;
}

export interface SensorValuesPredictResponse {
  sensorValuesPredict: SingleISensorData[];
}

export const SENSOR_VALUES_PREDICT = gql`
  query sensorValuesPredict(
    $deviceId: String!
    $sensorId: String!
    $seasonalityPeriod: Int!
    $mode: ExtremeOperation!
    $start: Date!
    $end: Date!
    $interval: Int
    $pastInterval: Int
    $lowerBound: Int
    $upperBound: Int
  ) {
    sensorValuesPredict(
      deviceId: $deviceId
      sensorId: $sensorId
      seasonalityPeriod: $seasonalityPeriod
      mode: $mode
      start: $start
      end: $end
      interval: $interval
      pastInterval: $pastInterval
      lowerBound: $lowerBound
      upperBound: $upperBound
    ) {
      ... on GaugeSensorData {
        type
        time
        value
      }
    }
  }
`;
