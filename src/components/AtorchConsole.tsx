import classNames from "classnames";
import _ from "lodash";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { ButtonGroup, Button, Row, Container, Table, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";

import locals from "./AtorchConsole.scss";

import { useWatchReport, useConnected } from "../hooks/atorch";
import { CommandType } from "../service/atorch-service";
import { requestDevice, connect, disconnect, sendCommand } from "../actions/atorch";
import { ReportType } from "../service/atorch-report";

const btnResets: Record<string, CommandType> = {
  "A·h": CommandType.ResetAh,
  "W·h": CommandType.ResetWh,
  Duration: CommandType.ResetDuration,
  All: CommandType.ResetAll,
};

const btnFn: Record<string, CommandType> = {
  Setup: CommandType.Setup,
  Enter: CommandType.Enter,
  "+": CommandType.Plus,
  "-": CommandType.Minus,
};

export const AtorchConsole: React.FC = () => {
  const dispatch = useDispatch();
  const connected = useConnected();
  const [resetDropdown, setResetDropdownOpen] = useState(false);
  const [report, setReport] = useState<ReportType>();

  useWatchReport(setReport);
  const onSendCommand = (type: CommandType) => dispatch(sendCommand(type));
  const onResetToggle = () => setResetDropdownOpen(!resetDropdown);
  const handleConnectDevice = async () => {
    if (connected) {
      await dispatch(disconnect());
    } else {
      await dispatch(requestDevice());
      await dispatch(connect());
    }
  };

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
    <Container className={locals.container}>
      <Row className="ml-2 justify-content-center">
        <Button outline onClick={handleConnectDevice}>
          {connected ? "Disconnect" : "Connect"}
        </Button>
        <ButtonDropdown className="ml-4" isOpen={resetDropdown} toggle={onResetToggle}>
          <DropdownToggle outline caret>
            Reset
          </DropdownToggle>
          <DropdownMenu>
            {_.map(btnResets, (type, text) => (
              <DropdownItem key={type} disabled={!connected} onClick={() => onSendCommand(type)}>
                Reset {text}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </ButtonDropdown>
      </Row>
      <Row className="ml-2 justify-content-center">
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
                <th className="text-monospace text-right">{key}</th>
                <td className="text-monospace">{value ?? "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
      <Row className="ml-2 justify-content-center">
        <ButtonGroup>
          {_.map(btnFn, (type, text) => (
            <Button key={type} outline disabled={!connected} onClick={() => onSendCommand(type)}>
              {text}
            </Button>
          ))}
        </ButtonGroup>
      </Row>
    </Container>
  );
};

function formatUnit(value: number | undefined, unit: string) {
  if (value === undefined) {
    return;
  } else if (value < 100) {
    return `${value * 10} m${unit}`;
  } else {
    return `${(value * 100) / 10000} ${unit}`;
  }
}
