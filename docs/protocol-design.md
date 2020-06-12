﻿# Atorch protocol design

## Initial connection information

### Bluetootch Profile

Device broadcast name: `UD18-SPP`, `AT24-SPP`, etc `*-SPP`

| Profile             |
| ------------------- |
| Serial Port Profile |

### Bluetootch LE

Device broadcast name: `UD18-BLE`, `AT24-BLE`, etc `*-BLE`

| Type           | UUID                                   |
| -------------- | -------------------------------------- |
| Service        | `0000FFE0-0000-1000-8000-00805F9B34FB` |
| Characteristic | `0000FFE1-0000-1000-8000-00805F9B34FB` |

## Packet layout

|    Offset | Field        | Block size | Note                                      |
| --------: | ------------ | ---------- | ----------------------------------------- |
|      `00` | Magic Header | 2 byte     | `FF 55`                                   |
|      `02` | Message Type | 1 byte     | [Message Type](#type-indicator)           |
|      `03` | Payload      |            |                                           |
| Last byte | Checksum     | 1 byte     | [Checksum Algorithm](#checksum-algorithm) |

### Type indicator

|         Type | Value | Payload size | Note                                  |
| -----------: | ----- | ------------ | ------------------------------------- |
| Message Type | `01`  | 32 byte      | Report                                |
| Message Type | `02`  | 4 byte       | [Reply](#reply)                       |
| Message Type | `11`  | 6 byte       | [Command](#command)                   |
|            - | -     | -            | -                                     |
|  Device Type | `01`  |              | [AC Meter Report](#ac-meter-report)   |
|  Device Type | `02`  |              | [DC Meter Report](#dc-meter-report)   |
|  Device Type | `03`  |              | [USB Meter Report](#usb-meter-report) |

### AC Meter Report

> Sample Packet:
> [packet-meter-ac.spec.ts](../src/service/atorch-packet/packet-meter-ac.spec.ts)

| Offset | Field        | Block size | Note                                |
| -----: | ------------ | ---------- | ----------------------------------- |
|   `03` | Device Type  | 1 byte     | `01` [Device Type](#type-indicator) |
|   `04` | Voltage      | 3 byte     | 24 bit BE                           |
|   `07` | Amp          | 3 byte     | 24 bit BE                           |
|   `0A` | Watt         | 3 byte     | 24 bit BE                           |
|   `0D` | kW·h         | 4 byte     | 32 bit BE                           |
|   `11` | Price        | 3 byte     | 24 bit BE                           |
|   `14` | Frequency    | 2 byte     | 16 bit BE                           |
|   `16` | Power factor | 2 byte     | 16 bit BE                           |
|   `18` | Tempoerature | 3 byte     | 24 bit BE                           |
|   `1A` | Hour         | 1 byte     |                                     |
|   `1B` | Minute       | 1 byte     |                                     |
|   `1C` | Second       | 1 byte     |                                     |
|   `1D` | End byte     | 1 byte     | `3C`                                |

### DC Meter Report

> There are currently no unpurchased product tests

| Offset | Field       | Block size | Note                                |
| -----: | ----------- | ---------- | ----------------------------------- |
|   `03` | Device Type | 1 byte     | `02` [Device Type](#type-indicator) |

### USB Meter Report

> Sample Packet:
> [packet-meter-usb.spec.ts](../src/service/atorch-packet/packet-meter-usb.spec.ts)

| Offset | Field        | Block size | Note                                |
| -----: | ------------ | ---------- | ----------------------------------- |
|   `03` | Device Type  | 1 byte     | `03` [Device Type](#type-indicator) |
|   `04` | Voltage      | 3 byte     | 24 bit BE                           |
|   `07` | Amp          | 3 byte     | 24 bit BE                           |
|   `0A` | mA·h         | 3 byte     | 24 bit BE                           |
|   `0D` | W·h          | 4 byte     | 32 bit BE                           |
|   `11` | USB D-       | 2 byte     | 16 bit BE                           |
|   `13` | USB D+       | 2 byte     | 16 bit BE                           |
|   `15` | Tempoerature | 3 byte     | 24 bit BE                           |
|   `17` |              | 1 byte     | unknown value                       |
|   `18` | Hour         | 1 byte     |                                     |
|   `19` | Minute       | 1 byte     |                                     |
|   `20` | Second       | 1 byte     |                                     |
|   `2A` | End byte     | 1 byte     | `3C`                                |

### Command

> Sample Packet:
> [packet-command.spec.ts](../src/service/atorch-packet/packet-command.spec.ts)

| Offset | Field       | Block size | Note                           |
| -----: | ----------- | ---------- | ------------------------------ |
|   `03` | Device Type | 1 byte     | [Device Type](#type-indicator) |
|   `04` | Command     | 1 byte     |                                |

| Device Type | Command | Action         |
| ----------: | ------: | -------------- |
|   USB Meter |    `01` | Reset W·h      |
|   USB Meter |    `02` | Reset A·h      |
|   USB Meter |    `03` | Reset Duration |
|             |    `05` | Reset All      |
|             |    `31` | Setup          |
|             |    `32` | Enter          |
|             |    `33` | `[+]` Command  |
|             |    `34` | `[-]` Command  |

### Reply

> Sample Packet:
> [packet-reply.spec.ts](../src/service/atorch-packet/packet-reply.spec.ts)

| Offset | Field | Block size |
| -----: | ----- | ---------- |
|   `03` | State | 2 byte     |

| Known State | Action      |
| ----------: | ----------- |
|     `02 01` | OK          |
|     `02 03` | Unsupported |

## Checksum Algorithm

> Without **Magic Header**

```javascript
const packet = Buffer.from("FF551103310000000001", "hex");

const payload = packet.slice(2, -1);
// "11033100000000" (hex string)

const checksum = payload.reduce((acc, item) => (acc + item) & 0xff, 0) ^ 0x44;
// checksum: 0x01

packet[packet.length - 1] == checksum;
// returns true
```

## Thanks

- <https://github.com/msillano/UD18-protocol-and-node-red>
