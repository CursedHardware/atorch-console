﻿# Atorch UD18 Protocol stack

## Host to Slave

| Function       | Packet                          |
| -------------- | ------------------------------- |
| Reset W·h      | `FF 55 11 03 01 00 00 00 00 51` |
| Reset A·h      | `FF 55 11 03 02 00 00 00 00 52` |
| Reset Duration | `FF 55 11 03 03 00 00 00 00 53` |
| Reset All      | `FF 55 11 03 05 00 00 00 00 5D` |
| Setup          | `FF 55 11 03 31 00 00 00 00 01` |
| Enter          | `FF 55 11 03 32 00 00 00 00 02` |
| [+] Command    | `FF 55 11 03 33 00 00 00 00 03` |
| [-] Command    | `FF 55 11 03 34 00 00 00 00 0C` |

## Slave to Host

| Function | Packet                    |
| -------- | ------------------------- |
| OK       | `FF 55 02 01 01 00 00 40` |

## Sample Packets

```plain
Offset   00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F

00000010 FF 55 01 03 00 01 F3 00 00 00 00 06 38 00 00 03
00000020 11 00 07 00 0A 00 00 00 12 2E 33 3C 00 00 00 00
00000030 00 00 00 4E
```

## Packet layout

```plain
0000 FF magic header
0001 55 magic header
0002 01 type: 01: data, 0x11: command, 02: ack-command
0003 03 ??

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
0017 00 maybe is temperature

0018 12 t-h, as BYTE, hour
0019 2E t-m, as BYTE, min
001A 33 t-s, as BYTE, sec.

001B 3C
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
const payload = Buffer.from("FF551103310000000001", "hex");

const checksum = payload.slice(2, -1).reduce((acc, item) => (acc + item) & 0xff, 0) ^ 0x44;
// checksum: 0x01

payload[payload.length - 1] == checksum;
// returns true
```

## Thanks

- <https://github.com/msillano/UD18-protocol-and-node-red>