import _ from "lodash";
import classNames from "classnames";
import React from "react";
import { Table } from "reactstrap";

import locals from "./index.scss";
import { ACMeterPacket } from "../../../service/atorch-packet";
import { FormattedUnit } from "./utils";

interface Props {
  packet: ACMeterPacket;
}

export const PrintACReport: React.FC<Props> = ({ packet }) => {
  const data: Record<string, any> = {
    Voltage: <FormattedUnit value={packet.mVoltage} unit="V" />,
    Ampere: <FormattedUnit value={packet.mAmpere} unit="A" />,
    Watt: <FormattedUnit value={packet.mWatt} unit="W" />,
    "W·h": <FormattedUnit value={packet.mWh} unit="W·h" />,
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
