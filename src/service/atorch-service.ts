import { EventEmitter } from 'events';
import { readPacket, PacketType, HEADER, assertPacket, MessageType } from './atorch-packet';

const UUID_SERVICE = '0000ffe0-0000-1000-8000-00805f9b34fb';
const UUID_CHARACTERISTIC = '0000ffe1-0000-1000-8000-00805f9b34fb';

const DISCONNECTED = 'gattserverdisconnected';
const VALUE_CHANGED = 'characteristicvaluechanged';

const EVENT_FAILED = 'failed';
const EVENT_PACKET = 'packet';

interface Events {
  disconnected(disconnected: boolean): void;
  failed(packet: Buffer): void;
  packet(packet: PacketType): void;
}

export class AtorchService {
  public static async requestDevice() {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [UUID_SERVICE] }],
    });
    return new AtorchService(device);
  }

  private blocks: Buffer[] = [];
  private events = new EventEmitter();
  private device: BluetoothDevice;

  private constructor(device: BluetoothDevice) {
    this.device = device;
    device.addEventListener(DISCONNECTED, () => {
      this.events.emit('disconnected', false);
    });
  }

  public async connect() {
    const characteristic = await this.getCharacteristic();
    characteristic?.addEventListener(VALUE_CHANGED, this.handleValueChanged);
    await characteristic?.startNotifications();
  }

  public async disconnect() {
    try {
      this.device.gatt?.disconnect();
    } catch {
      // ignore
    }
    this.events.removeAllListeners();
  }

  public async sendCommand(block: Buffer) {
    assertPacket(block, MessageType.Command);
    const characteristic = await this.getCharacteristic();
    await characteristic?.writeValue(block);
  }

  private getCharacteristic = async () => {
    const server = await this.device.gatt?.connect();
    const service = await server?.getPrimaryService(UUID_SERVICE);
    return service?.getCharacteristic(UUID_CHARACTERISTIC);
  };

  public on<K extends keyof Events>(event: K, listener: Events[K]): () => void;
  public on(event: string, listener: (...args: unknown[]) => void) {
    this.events.on(event, listener);
    return () => {
      this.events.off(event, listener);
    };
  }

  private handleValueChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const payload = Buffer.from(target.value?.buffer ?? []);
    if (payload.indexOf(HEADER) === 0) {
      if (this.blocks.length !== 0) {
        this.emitBlock(Buffer.concat(this.blocks));
      }
      this.blocks = [payload];
    } else {
      this.blocks.push(payload);
    }
  };

  private emitBlock(block: Buffer) {
    console.log('Block', block.toString('hex').toUpperCase());
    try {
      const packet = readPacket(block);
      this.events.emit(EVENT_PACKET, packet);
    } catch {
      this.events.emit(EVENT_FAILED, block);
    }
  }
}
