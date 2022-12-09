import { DeviceType, SensorId } from './schema';

export const tableSensorIds: Record<DeviceType, SensorId[]> = {
  [DeviceType.CAMERA]: [
    SensorId.CAMERA_GENDER,
    SensorId.CAMERA_CLOTHES_COLOR,
    SensorId.CAMERA_NUMBER_PLATE,
  ],
  [DeviceType.CHARGING]: [
    SensorId.CHARGING_STATUS,
    SensorId.CHARGING_30_DAYS_METER,
    SensorId.CHARGING_30_DAYS_COUNT,
  ],
  [DeviceType.DISPLAY]: [SensorId.DISPLAY_PLAYER_ADDRESS],
  [DeviceType.ENVIRONMENT]: [
    SensorId.ENV_PM10,
    SensorId.ENV_PM2_5,
    SensorId.ENV_TEMPERATURE,
    SensorId.ENV_HUMIDITY,
  ],
  [DeviceType.LAMP]: [
    SensorId.LAMP_BRIGHTNESS_PERCENT,
    SensorId.LAMP_POWER_CON,
    SensorId.LAMP_VOLTAGE,
    SensorId.LAMP_CURRENT,
    SensorId.LAMP_TEMP,
  ],
  [DeviceType.SOLAR]: [
    SensorId.SOLAR_BAT_VOLTAGE,
    SensorId.SOLAR_BAT_CURRENT,
    SensorId.SOLAR_BAT_CAPACITY,
  ],
  [DeviceType.WATER]: [SensorId.WATER_LEVEL, SensorId.WATER_VOLT],
  [DeviceType.WIFI]: [
    SensorId.WIFI_CONN_USER_COUNT,
    SensorId.WIFI_UPLOAD_SPEED,
    SensorId.WIFI_DOWNLOAD_SPEED,
  ],
  [DeviceType.UNKNOWN]: [],
  [DeviceType.BUILDING]: [],
  [DeviceType.INDOOR_LAMP]: [],
  [DeviceType.CHILLER]: [],
  [DeviceType.SPEAKER]: [],
  [DeviceType.FIRE_ALARM]: [],
  [DeviceType.POWER_METER]: [SensorId.POWER_METER_POWER_CONSUMPTION],
  [DeviceType.ELEVATOR]: [],
  [DeviceType.BANPU_INDOOR_METER]: [
    SensorId.BANPU_INDOOR_METER_CO2,
    SensorId.BANPU_INDOOR_METER_TEMPERATURE,
  ],
  [DeviceType.OPEN_DATA_WEATHER]: [
    SensorId.TEMP_C,
    SensorId.CONDITION_CODE,
    SensorId.WIND_KPH,
    SensorId.WIND_KPH,
    SensorId.WIND_DEGREE,
    SensorId.HUMIDITY,
    SensorId.IS_DAY,
    SensorId.UV,
    SensorId.TEMP_C_1,
    SensorId.TEMP_C_2,
    SensorId.TEMP_C_3,
    SensorId.TEMP_C_4,
    SensorId.TEMP_C_5,
    SensorId.TEMP_C_6,
    SensorId.CONDITION_CODE_1,
    SensorId.CONDITION_CODE_2,
    SensorId.CONDITION_CODE_3,
    SensorId.CONDITION_CODE_4,
    SensorId.CONDITION_CODE_5,
    SensorId.CONDITION_CODE_6,
    SensorId.WIND_KPH_1,
    SensorId.WIND_KPH_2,
    SensorId.WIND_KPH_3,
    SensorId.WIND_KPH_4,
    SensorId.WIND_KPH_5,
    SensorId.WIND_KPH_6,
    SensorId.HUMIDITY_1,
    SensorId.HUMIDITY_2,
    SensorId.HUMIDITY_3,
    SensorId.HUMIDITY_4,
    SensorId.HUMIDITY_5,
    SensorId.HUMIDITY_6,
    SensorId.IS_DAY_1,
    SensorId.IS_DAY_2,
    SensorId.IS_DAY_3,
    SensorId.IS_DAY_4,
    SensorId.IS_DAY_5,
    SensorId.IS_DAY_6,
  ],
  [DeviceType.USAGE_METER]: [],
};

export const subscribeSensorIds: Record<DeviceType, SensorId[]> = {
  ...tableSensorIds,
  [DeviceType.CAMERA]: [
    ...tableSensorIds[DeviceType.CAMERA],
    SensorId.CAMERA_PEDESTRIAN,
    SensorId.CAMERA_VEHICLE,
  ],
  [DeviceType.DISPLAY]: [...tableSensorIds[DeviceType.DISPLAY], SensorId.DISPLAY_PLAYER_SNAPSHOT],
};