import gql from 'graphql-tag';

export interface SensorValuesMetricAggregationPayload {
  deviceId: string;
  sensorId: string;
  start: Date;
  end: Date;
}

export interface SensorValuesMetricAggregationResponse {
  sensorValuesMetricAggregation: {
    min: number | null;
    max: number | null;
    avg: number | null;
    sum: number | null;
    count: number | null;
  };
}

export const SENSOR_VALUES_METRIC_AGGREGATION = gql`
  query sensorValuesMetricAggregation(
    $deviceId: String!
    $sensorId: String!
    $start: Date!
    $end: Date!
  ) {
    sensorValuesMetricAggregation(
      deviceId: $deviceId
      sensorId: $sensorId
      start: $start
      end: $end
    ) {
      min
      max
      avg
      sum
      count
    }
  }
`;
