import { EventEmitter } from "events";
import { readPacket, PacketType, HEADER, CommandPacket } from "./atorch-packet";

const UUID_SERVICE = "0000ffe0-0000-1000-8000-00805f9b34fb";
const UUID_CHARACTERISTIC = "0000ffe1-0000-1000-8000-00805f9b34fb";

const EVENT_AVAILABILITY = "availability";
const EVENT_CONNECTION_STATE = "connection-state";
const EVENT_DATA_ERROR = "data-error";
const EVENT_PACKET = "packet";

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
    device.addEventListener("availabilitychanged", async () => this.events.emit(EVENT_AVAILABILITY, await navigator.bluetooth.getAvailability()));
    device.addEventListener("gattserverdisconnected", () => this.events.emit(EVENT_CONNECTION_STATE, false));
  }

  public async connect() {
    const server = await this.device.gatt?.connect();
    const service = await server?.getPrimaryService(UUID_SERVICE);

    const characteristic = await service?.getCharacteristic(UUID_CHARACTERISTIC);
    characteristic?.addEventListener("characteristicvaluechanged", this.handleValueChanged);
    await characteristic?.startNotifications();

    this.characteristic = characteristic;

    this.events.emit(EVENT_CONNECTION_STATE, true);
  }

  public async disconnect() {
    await this.characteristic?.stopNotifications();
    this.device.gatt?.disconnect();
  }

  public async sendCommand(code: number) {
    const value = CommandPacket.make(0x03, code);
    await this.characteristic?.writeValue(value);
  }

  public on(event: typeof EVENT_AVAILABILITY, listener: (available: boolean) => void): () => void;
  public on(event: typeof EVENT_CONNECTION_STATE, listener: (state: boolean) => void): () => void;
  public on(event: typeof EVENT_DATA_ERROR, listener: (block: Buffer) => void): () => void;
  public on(event: typeof EVENT_PACKET, listener: (packet: PacketType) => void): () => void;
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
      this.events.emit(EVENT_DATA_ERROR, block);
    }
  }
}

const getChecksum = (block: Uint8Array) => {
  const checksum = block.reduce((acc, value) => (acc + value) & 0xff);
  return checksum ^ 0x44;
};
