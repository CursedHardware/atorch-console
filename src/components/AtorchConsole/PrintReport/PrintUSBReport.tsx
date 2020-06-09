import _ from "lodash";
import classNames from "classnames";
import React from "react";
import { Table } from "reactstrap";

import locals from "./index.scss";

import { USBMeterPacket } from "../../../service/atorch-packet";
import { FormattedUnit } from "./utils";

interface Props {
  packet: USBMeterPacket;
}

export const PrintUSBReport: React.FC<Props> = ({ packet }) => {
  const data: Record<string, React.ReactNode> = {
    Voltage: <FormattedUnit value={packet.mVoltage} unit="V" />,
    Ampere: <FormattedUnit value={packet.mAmpere} unit="A" />,
    Watt: <FormattedUnit value={packet.mWatt} unit="W" />,
    "A·h": <FormattedUnit value={packet.mAh} unit="A·h" />,
    "W·h": <FormattedUnit value={packet.mWh} unit="W·h" />,
    "D-": <FormattedUnit value={packet.dataN} unit="V" />,
    "D+": <FormattedUnit value={packet.dataP} unit="V" />,
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
            <th className={classNames("text-monospace", "text-right")}>
              {key}
            </th>
            <td className="text-monospace">{value ?? "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
