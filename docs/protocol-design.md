# Atorch protocol design

## Host to Slave (USB Meter available)

| Function       | Packet                          |
| -------------- | ------------------------------- |
| Reset W·h      | `FF 55 11 03 01 00 00 00 00 51` |
| Reset A·h      | `FF 55 11 03 02 00 00 00 00 52` |
| Reset Duration | `FF 55 11 03 03 00 00 00 00 53` |
| Reset All      | `FF 55 11 03 05 00 00 00 00 5D` |
| Setup          | `FF 55 11 03 31 00 00 00 00 01` |
| Enter          | `FF 55 11 03 32 00 00 00 00 02` |
| `[+]` Command  | `FF 55 11 03 33 00 00 00 00 03` |
| `[-]` Command  | `FF 55 11 03 34 00 00 00 00 0C` |

## Slave to Host (Generanl)

| Function | Packet                    |
| -------- | ------------------------- |
| OK       | `FF 55 02 01 01 00 00 40` |

## Sample Packets (from UD18)

```plain
Offset  00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F

0000000 FF 55 01 03 00 01 F3 00 00 00 00 06 38 00 00 03
0000010 11 00 07 00 0A 00 00 00 12 2E 33 3C 00 00 00 00
0000020 00 00 00 4E

0000000 FF 55 01 03 00 01 FC 00 00 00 00 45 7F 00 00 52
0000010 94 00 07 00 07 00 00 00 10 24 2A 3C 00 00 00 00
0000020 00 00 00 17
```

## AT24 Report Packet layout (AC Meter)

```plain
0000 FF magic header
0001 55 magic header

0002 01 command type: 01: data, 02: ack-command, 11: command
0003 03  device type: 01: AC, 03: USB

0004 00 V
0005 08 V
0006 FF V, as INT24, /10

0007 00 A
0008 00 A
0009 00 A, as INT24, /10

000A 00 W
000B 00 W
000C 00 W, as INT24, /10

000D 00 kWh
000E 00 kWh
000F 00 kWh
0010 00 kWh, as INT16, /100

0011 00 price
0012 00 price
0013 64 price, as INT16, /100

0014 01 frequency
0015 F4 frequency, as INT16, /10

0016 00 power factor
0017 85 power factor, as INT16, /1000

0018 00 internal temperature
0019 2F internal temperature, as INT16

001A 12 t-h, as BYTE, hour
001B 2E t-m, as BYTE, min
001C 33 t-s, as BYTE, sec.

001D 3C magic end

001E 00
001F 00
0020 00
0021 00
0022 00

0023 A1 checksum
```

## UD18 Report Packet layout (USB Meter)

```plain
0000 FF magic header
0001 55 magic header

0002 01 command type: 01: data, 02: ack-command, 11: command
0003 03  device type: 01: AC, 03: USB

0004 00 V
0005 00 V
0006 00 V, as INT24, /100

0007 00 I
0008 00 I
0009 00 I, as INT24, /100

000A 00 mAh
000B 00 mAh
000C 00 mAh, as INT24,

000D 00 Wh
000E 00 Wh
000F 00 Wh
0010 00 Wh, as INT32, /100

0011 00 D-
0012 07 D- as INT16, /100

0013 00 D+
0014 0A D+ as INT16, /100

0015 00 maybe is temperature
0016 00 maybe is temperature

0017 00 ??

0018 12 t-h, as BYTE, hour
0019 2E t-m, as BYTE, min
001A 33 t-s, as BYTE, sec.

001B 3C magic end

001C 00
001D 00
001E 00
001F 00
0020 00
0021 00
0022 00

0023 4E checksum
```

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
