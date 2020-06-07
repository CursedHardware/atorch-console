import _ from "lodash";
import React from "react";
import { Table } from "reactstrap";
import classNames from "classnames";
import locals from "./index.scss";
import { MeterPacketType, USBMeterPacket, ACMeterPacket } from "../../service/atorch-packet";

interface Props {
  packet?: MeterPacketType;
}

export const PrintReport: React.FC<Props> = ({ packet }) => {
  if (packet instanceof USBMeterPacket) {
    return <PrintUSBReport packet={packet} />;
  } else if (packet instanceof ACMeterPacket) {
    return <PrintACReport packet={packet} />;
  }
  return <p>Not connected to device.</p>;
};

const PrintUSBReport: React.FC<{ packet: USBMeterPacket }> = ({ packet }) => {
  const data: Record<string, string | undefined> = {
    Voltage: formatUnit(packet.mVoltage, "V"),
    Ampere: formatUnit(packet.mAmpere, "A"),
    Watt: formatUnit(packet.mWatt, "W"),
    "A·h": formatUnit(packet.mAh, "A·h"),
    "W·h": formatUnit(packet.mWh, "W·h"),
    "D-": formatUnit(packet.dataN, "V"),
    "D+": formatUnit(packet.dataP, "V"),
    Temperature: `${packet.temperature || "N/A"} \u2103`,
    Duration: packet.duration,
  };
  return (
    <Table hover borderless size="sm" className={locals.table}>
      <thead>
        <tr>
          <th className={classNames("text-right", locals.name)}>#</th>
          <th className={locals.value}>Value</th>
        </tr>
      </thead>
      <tbody>
        {_.map(data, (value, key) => (
          <tr key={key}>
            <th className={classNames("text-monospace", "text-right")}>{key}</th>
            <td className="text-monospace">{value ?? "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const PrintACReport: React.FC<{ packet: ACMeterPacket }> = ({ packet }) => {
  const data: Record<string, any> = {
    Voltage: formatUnit(packet.mVoltage, "V"),
    Ampere: formatUnit(packet.mAmpere, "A"),
    Watt: formatUnit(packet.mWatt, "W"),
    "W·h": formatUnit(packet.mWh, "W·h"),
    Price: packet.price / 100,
    Fee: packet.fee / 100,
    Frequency: `${packet.frequency} Hz`,
    PF: packet.pf,
    Temperature: `${packet.temperature} \u2103`,
    Duration: packet.duration,
  };

  return (
    <Table hover borderless size="sm" className={locals.table}>
      <thead>
        <tr>
          <th className={classNames("text-right", locals.name)}>#</th>
          <th className={locals.value}>Value</th>
        </tr>
      </thead>
      <tbody>
        {_.map(data, (value, key) => (
          <tr key={key}>
            <th className={classNames("text-monospace", "text-right")}>{key}</th>
            <td className="text-monospace">{value ?? "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

function formatUnit(value: number, unit: string) {
  const prefixes = ["m", "", "k"];
  for (const prefix of prefixes) {
    if (value > 1000) {
      value /= 1000;
      continue;
    }
    return `${value} ${prefix}${unit}`;
  }
}
