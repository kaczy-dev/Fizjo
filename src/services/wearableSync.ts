import { WearableDevice } from '../types';

// Web Bluetooth API Type declarations for environments without @types/web-bluetooth
interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

export class WearableSyncService {
  private static bleDevice: BluetoothDevice | null = null;
  private static hrServer: BluetoothRemoteGATTServer | null = null;

  public static isBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in (navigator as unknown as { bluetooth?: unknown });
  }

  // Connect via Web Bluetooth standard Heart Rate Profile (0x180D)
  public static async connectBluetoothHeartRate(
    onHeartRateUpdate: (bpm: number) => void,
    onDisconnected: () => void
  ): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!this.isBluetoothSupported()) {
      return { success: false, error: 'Twoja przeglądarka nie obsługuje Web Bluetooth API. Możesz skorzystać z integracji plików Apple Health / Google Fit.' };
    }

    try {
      // Standard Bluetooth SIG Heart Rate Service UUID
      const nav = navigator as unknown as { bluetooth: { requestDevice: (options: unknown) => Promise<BluetoothDevice> } };
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service']
      });

      this.bleDevice = device;
      device.addEventListener('gattserverdisconnected', () => {
        this.hrServer = null;
        onDisconnected();
      });

      if (!device.gatt) {
        throw new Error('Brak interfejsu GATT w urządzeniu.');
      }

      const server = await device.gatt.connect();
      this.hrServer = server;

      const hrService = await server.getPrimaryService('heart_rate');
      const hrChar = await hrService.getCharacteristic('heart_rate_measurement');

      await hrChar.startNotifications();
      hrChar.addEventListener('characteristicvaluechanged', (event) => {
        const value = (event.target as unknown as BluetoothRemoteGATTCharacteristic).value;
        if (value) {
          // Parse Bluetooth SIG Heart Rate Measurement
          const flags = value.getUint8(0);
          const is16Bit = flags & 0x01;
          const bpm = is16Bit ? value.getUint16(1, true) : value.getUint8(1);
          onHeartRateUpdate(bpm);
        }
      });

      return {
        success: true,
        deviceName: device.name || 'Zegarek / Opaska BLE'
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Anulowano lub błąd połączenia BLE';
      return { success: false, error: message };
    }
  }

  public static disconnectBluetooth(): void {
    if (this.bleDevice && this.bleDevice.gatt && this.bleDevice.gatt.connected) {
      this.bleDevice.gatt.disconnect();
    }
    this.bleDevice = null;
    this.hrServer = null;
  }

  // Simulated live sync for testing / non-BLE users
  public static simulateLiveSync(current: WearableDevice): WearableDevice {
    const randomBpm = 68 + Math.floor(Math.random() * 14);
    const addedSteps = Math.floor(Math.random() * 250);
    return {
      ...current,
      connected: true,
      currentHeartRate: randomBpm,
      todaySteps: (current.todaySteps || 6000) + addedSteps,
      batteryLevel: Math.max(20, (current.batteryLevel || 90) - (Math.random() > 0.8 ? 1 : 0)),
      lastSync: new Date().toISOString()
    };
  }

  // Export session data for Apple Health / Google Fit / Garmin
  public static exportSessionToHealthKitJson(session: {
    durationMinutes: number;
    caloriesBurned: number;
    avgHeartRate: number;
    date: string;
    exercisesCompleted: string[];
  }): void {
    const healthPayload = {
      exportType: 'AppleHealth_GoogleFit_RehabWorkout',
      workoutType: 'HKWorkoutActivityTypeFlexibility',
      title: 'Rehabilitacja Szyi i Kręgosłupa - Moje Fizjo',
      startDate: session.date,
      durationMinutes: session.durationMinutes,
      activeEnergyBurnedKcal: session.caloriesBurned,
      averageHeartRateBpm: session.avgHeartRate,
      metadata: {
        exercises: session.exercisesCompleted,
        source: 'Moje Fizjo Gov Spine & Neck Rehab'
      }
    };

    const blob = new Blob([JSON.stringify(healthPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trening_fizjo_sync_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
