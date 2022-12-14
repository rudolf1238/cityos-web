import gql from 'graphql-tag';

import { IDevice, Sensor } from 'city-os-common/libs/schema';

export interface GetDevicePayload {
  deviceId: string;
}

export interface PartialDevice
  extends Pick<
    IDevice,
    | 'deviceId'
    | 'name'
    | 'groups'
    | 'desc'
    | 'type'
    | 'location'
    | 'attributes'
    | 'status'
    | 'imageIds'
  > {
  sensors: Omit<Sensor, 'attributes'>[];
}

export interface GetDeviceResponse {
  getDevices: PartialDevice[];
}

export const GET_DEVICE_ON_INDOOR_MOBILE = gql`
  query getDeviceOnIndoorMobile($deviceId: String!) {
    getDevices(deviceIds: [$deviceId]) {
      deviceId
      name
      desc
      groups {
        id
        name
        projectKey
      }
      type
      location {
        lat
        lng
      }
      attributes {
        key
        value
      }
      sensors {
        sensorId
        name
        type
        unit
        desc
      }
      imageIds
    }
  }
`;
