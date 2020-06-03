# Atorch AT24 Protocol stack

## Packet layout

```plain
0000 FF magic header
0001 55 magic header
0002 01 type: 01: data, 0x11: command, 02: ack-command
0003 01 type: 01: AC, 03: USB

0004 00 V
0005 08 V
0006 FF V, as INT24, /10

0007 00 A
0008 00 A
0009 00 A, as INT24, /10

000A 00 W
000B 00 W
000C 00 W, as INT24, /10

000D 00
000E 00
000F 00

0010 00
0011 00
0012 00

0013 64

0014 01 Frequency
0015 F4 Frequency, as INT16, /10

0016 00
0017 85 Power factor as INT16

0018 00
0019 2F Internal temperature as INT16

001A 00
001B 12 t-h, as BYTE, hour
001C 2E t-m, as BYTE, min
001C 33 t-s, as BYTE, sec.

001E 3C

001F 00
0020 00
0021 00
0022 00

0023 A1
```
