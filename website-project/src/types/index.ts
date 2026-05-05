// Device and Sensor Types
export interface SensorReading {
  temperature: number;
  humidity: number;
  waterLevel: number;
  waterVolume: number;
  flameSensor: 'CLEAR' | 'DETECTED';
  pumpState: 'ON' | 'IDLE';
  servoPosition: number;
  timestamp: number;
}

export interface DeviceInfo {
  id: string;
  zone: string;
  lastUpdate: number;
  online: boolean;
  firmwareVersion: string;
}

export interface SystemHealth {
  status: 'ONLINE' | 'OFFLINE';
  uptime: number;
  signalStrength: number;
  lastHeartbeat: number;
}

export interface FirebaseEvent {
  id?: string;
  type: 'FIRE_DETECTED' | 'WATER_LEVEL_LOW' | 'PUMP_ACTIVATED' | 'PUMP_DEACTIVATED' | 'FIRE_CLEARED' | string;
  status: 'NORMAL' | 'ALERT' | 'WARNING';
  details: string;
  source: string;
  timestamp: number;
}

export interface SystemSettings {
  automation: {
    sprayDuration: number;
    cooldownPeriod: number;
    waterLevelThreshold: number;
    telemetryInterval: number;
  };
}

export interface HistoricalData {
  timestamp: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
}

// UI State Types
export interface DashboardState {
  currentSensor: SensorReading | null;
  device: DeviceInfo | null;
  health: SystemHealth | null;
  events: FirebaseEvent[];
  settings: SystemSettings | null;
  history: HistoricalData[];
  loading: boolean;
  error: string | null;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  status?: 'normal' | 'warning' | 'danger';
  trend?: number;
}
