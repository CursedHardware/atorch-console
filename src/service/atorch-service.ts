import { EventEmitter } from "events";
import { makeReport, ReportType } from "./atorch-report";

const UUID_SERVICE = "0000ffe0-0000-1000-8000-00805f9b34fb";
const UUID_CHARACTERISTIC = "0000ffe1-0000-1000-8000-00805f9b34fb";
const HEADER = Buffer.of(0xff, 0x55);
const COMMAND_SUCCESSFUL = Buffer.of(0x01, 0x01);

const EVENT_AVAILABILITY = "availability";
const EVENT_COMMAND_STATE = "command-state";
const EVENT_CONNECTION_STATE = "connection-state";
const EVENT_DATA_ERROR = "data-error";
const EVENT_REPORT = "report";
const EVENT_UNHANDLED = "unhandled";

enum MessageType {
  Data = 0x01,
  Confirm = 0x02,
  Command = 0x11,
}

export enum CommandType {
  ResetWh = 0x01,
  ResetAh = 0x02,
  ResetDuration = 0x03,
  ResetAll = 0x05,
  Setup = 0x31,
  Enter = 0x32,
  Plus = 0x33,
  Minus = 0x34,
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

  public async sendCommand(type: CommandType, data = Buffer.of(0x00, 0x00, 0x00, 0x00)) {
    const payload = Buffer.of(MessageType.Command, 0x03, type, ...data);
    const value = Buffer.concat([HEADER, payload, Buffer.of(getChecksum(payload))]);
    await this.characteristic?.writeValue(value);
    return new Promise<boolean>((resolve) => {
      const returns = (state: boolean) => (off(), resolve(state));
      const off = this.on(EVENT_COMMAND_STATE, returns);
      setTimeout(returns, 1000, false);
    });
  }

  public on(event: typeof EVENT_AVAILABILITY, listener: (available: boolean) => void): () => void;
  public on(event: typeof EVENT_COMMAND_STATE, listener: (state: boolean) => void): () => void;
  public on(event: typeof EVENT_CONNECTION_STATE, listener: (state: boolean) => void): () => void;
  public on(event: typeof EVENT_DATA_ERROR, listener: (block: Buffer) => void): () => void;
  public on(event: typeof EVENT_REPORT, listener: (report: ReportType) => void): () => void;
  public on(event: typeof EVENT_UNHANDLED, listener: (block: Buffer) => void): () => void;
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
    if (block[block.length - 1] !== getChecksum(block.slice(2, -1))) {
      this.events.emit(EVENT_DATA_ERROR, block);
      return;
    }
    const type = block[2];
    if (type === MessageType.Data) {
      this.events.emit(EVENT_REPORT, makeReport(block));
    } else if (type === MessageType.Confirm) {
      this.events.emit(EVENT_COMMAND_STATE, block.slice(3, 5).equals(COMMAND_SUCCESSFUL));
    } else {
      this.events.emit(EVENT_UNHANDLED, block);
    }
  }
}

const getChecksum = (block: Uint8Array) => {
  const checksum = block.reduce((acc, value) => (acc + value) & 0xff);
  return checksum ^ 0x44;
};
