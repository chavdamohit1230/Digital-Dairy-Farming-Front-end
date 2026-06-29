/**
 * IoT Integration - Ready for future device integration
 * Smart collar heat detection, milk meter, temperature, RFID, GPS
 */

export type IoTDeviceType =
  | "smart_collar_heat"
  | "milk_meter"
  | "temperature_sensor"
  | "rfid_reader"
  | "gps_tracker";

export interface IoTDevice {
  id: string;
  farmId: string;
  type: IoTDeviceType;
  name: string;
  serialNumber?: string;
  animalId?: string;
  lastSync?: string;
  enabled: boolean;
}

export interface MilkMeterReading {
  deviceId: string;
  animalId: string;
  timestamp: string;
  yieldLiters: number;
  fatPercent?: number;
}

export interface HeatCollarReading {
  deviceId: string;
  animalId: string;
  timestamp: string;
  activityLevel: number;
  heatDetected: boolean;
}

export interface TemperatureReading {
  deviceId: string;
  animalId?: string;
  timestamp: string;
  temperatureCelsius: number;
  feverThreshold?: number;
}
