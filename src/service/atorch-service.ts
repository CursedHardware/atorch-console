import { EventEmitter } from "events";
import {
  readPacket,
  PacketType,
  HEADER,
  assertPacket,
  MessageType,
} from "./atorch-packet";

const UUID_SERVICE = "0000ffe0-0000-1000-8000-00805f9b34fb";
const UUID_CHARACTERISTIC = "0000ffe1-0000-1000-8000-00805f9b34fb";

const EVENT_STATE = "state";
const EVENT_WRONG = "wrong";
const EVENT_PACKET = "packet";

interface Events {
  availability(available: boolean): void;
  state(state: boolean): void;
  wrong(packet: Buffer): void;
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
  private characteristic: BluetoothRemoteGATTCharacteristic | undefined;

  private constructor(device: BluetoothDevice) {
    this.device = device;
    device.addEventListener("gattserverdisconnected", () =>
      this.events.emit(EVENT_STATE, false),
    );
  }

  public async connect() {
    const server = await this.device.gatt?.connect();
    const service = await server?.getPrimaryService(UUID_SERVICE);

    const characteristic = await service?.getCharacteristic(
      UUID_CHARACTERISTIC,
    );
    characteristic?.addEventListener(
      "characteristicvaluechanged",
      this.handleValueChanged,
    );
    await characteristic?.startNotifications();

    this.characteristic = characteristic;

    this.events.emit(EVENT_STATE, true);
  }

  public async disconnect() {
    await this.characteristic?.stopNotifications();
    this.device.gatt?.disconnect();
  }

  public async sendCommand(block: Buffer) {
    assertPacket(block, MessageType.Command);
    return this.characteristic?.writeValue(block);
  }

  public on<K extends keyof Events>(event: K, listener: Events[K]): () => void;
  public on(event: string, listener: (...args: any) => void) {
    this.events.on(event, listener);
    return () => {
      this.events.off(event, listener);
    };
  }

  private handleValueChanged = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const payload = Buffer.from(target.value!.buffer);
    if (HEADER.equals(payload.slice(0, 2))) {
      if (this.blocks.length !== 0) {
        this.emitBlock(Buffer.concat(this.blocks));
      }
      this.blocks = [payload];
    } else {
      this.blocks.push(payload);
    }
  };

  private emitBlock(block: Buffer) {
    console.log("Block", block.toString("hex").toUpperCase());
    try {
      const packet = readPacket(block);
      this.events.emit(EVENT_PACKET, packet);
    } catch {
      this.events.emit(EVENT_WRONG, block);
    }
  }
}
