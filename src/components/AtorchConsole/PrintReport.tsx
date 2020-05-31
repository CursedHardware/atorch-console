import _ from "lodash";
import React from "react";
import { Table } from "reactstrap";
import classNames from "classnames";
import locals from "./index.scss";
import { ReportType } from "../../service/atorch-report";

interface Props {
  report?: ReportType;
}

export const PrintReport: React.FC<Props> = ({ report }) => {
  const data: Record<string, string | undefined> = {
    Voltage: formatUnit(report?.mVoltage, "V"),
    Ampere: formatUnit(report?.mAmpere, "A"),
    Watt: formatUnit(report?.mWatt, "W"),
    "A·h": formatUnit(report?.mAh, "A·h"),
    "W·h": formatUnit(report?.mWh, "W·h"),
    "D+": formatUnit(report?.dataP, "V"),
    "D-": formatUnit(report?.dataN, "V"),
    Duration: report?.duration,
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

function formatUnit(value: number | undefined, unit: string) {
  if (value === undefined) {
    return;
  }
  const prefixes = ["m", "", "k"];
  for (const prefix of prefixes) {
    if (value > 1000) {
      value /= 1000;
      continue;
    }
    return `${value} ${prefix}${unit}`;
  }
}
