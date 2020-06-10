# Atorch protocol design

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

| Field        | Definition | Note                                            |
| ------------ | ---------- | ----------------------------------------------- |
| Magic Header | `FF 55`    |                                                 |
| Message Type | BYTE       | `01`: Report, `02`: Reply, `11`: Command        |
| Data block   | BYTE[]     | [Data block definition](#data-block-definition) |
| Checksum     | BYTE       | [Checksum Algorithm](#checksum-algorithm)       |

### Data block definiton

| Kind    | Block size | Links                                                      |
| ------- | ---------- | ---------------------------------------------------------- |
| Report  | 32 byte    | [AC Meter](#ac-meter-report)<br>[Meter](#usb-meter-report) |
| Reply   | 4 byte     | [Reply](#reply)                                            |
| Command | 6 byte     | [Command](#command)                                        |

### AC Meter Report

> Sample Packet:
> [packet-meter-ac.spec.ts](src/service/atorch-packet/packet-meter-ac.spec.ts)

| Field        | Block size | Note      |
| ------------ | ---------- | --------- |
| Device Type  | `01`       |           |
| Voltage      | 3 byte     | 24 bit BE |
| Amp          | 3 byte     | 24 bit BE |
| Watt         | 3 byte     | 24 bit BE |
| kW·h         | 4 byte     | 32 bit BE |
| Price        | 3 byte     | 24 bit BE |
| Frequency    | 2 byte     | 16 bit BE |
| Power factor | 2 byte     | 16 bit BE |
| Tempoerature | 2 byte     | 16 bit BE |
| Hour         | 1 byte     |           |
| Minute       | 1 byte     |           |
| Second       | 1 byte     |           |
| End byte     | `3C`       |           |

### USB Meter Report

> Sample Packet:
> [packet-meter-usb.spec.ts](src/service/atorch-packet/packet-meter-usb.spec.ts)

| Field        | Block size | Note      |
| ------------ | ---------- | --------- |
| Device Type  | `03`       |           |
| Voltage      | 3 byte     | 24 bit BE |
| Amp          | 3 byte     | 24 bit BE |
| mA·h         | 3 byte     | 24 bit BE |
| W·h          | 4 byte     | 32 bit BE |
| USB D-       | 2 byte     | 16 bit BE |
| USB D+       | 2 byte     | 16 bit BE |
| Tempoerature | 3 byte     | 24 bit BE |
| Hour         | 1 byte     |           |
| Minute       | 1 byte     |           |
| Second       | 1 byte     |           |
| End byte     | `3C`       |           |

### Reply

> Sample Packet:
> [packet-reply.spec.ts](src/service/atorch-packet/packet-reply.spec.ts)

| Field | Block size | Note |
| ----- | ---------- | ---- |
| State | 2 byte     |      |

| Known State | Action      |
| ----------- | ----------- |
| `02 01`     | OK          |
| `02 03`     | Unsupported |

### Command

> Sample Packet:
> [packet-command.spec.ts](src/service/atorch-packet/packet-command.spec.ts)

| Field       | Block size | Note                          |
| ----------- | ---------- | ----------------------------- |
| Device Type | 1 byte     | `01`: AC, `02`: DC, `03`: USB |
| Command     | 1 byte     |                               |

| Device Type | Command | Action         |
| ----------- | ------- | -------------- |
| AC Meter    | `05`    | Reset All      |
| AC Meter    | `31`    | Setup          |
| AC Meter    | `32`    | Enter          |
| AC Meter    | `33`    | `[+]` Command  |
| AC Meter    | `34`    | `[-]` Command  |
| -           | -       | -              |
| USB Meter   | `01`    | Reset W·h      |
| USB Meter   | `02`    | Reset A·h      |
| USB Meter   | `03`    | Reset Duration |
| USB Meter   | `05`    | Reset All      |
| USB Meter   | `31`    | Setup          |
| USB Meter   | `32`    | Enter          |
| USB Meter   | `33`    | `[+]` Command  |
| USB Meter   | `34`    | `[-]` Command  |

## Checksum Algorithm

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
